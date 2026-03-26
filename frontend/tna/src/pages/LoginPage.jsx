import "../App.css";
import "./LoginRegister.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getErrorMessage } from "../utils/errorUtil";
import { fetchJson } from "../utils/api";

const MAIL_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 16;

function isValidEmail(value) {
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return regex.test(value);
}

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mailError, setMailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [commonError, setCommonError] = useState("");

  const validate = () => {
    let valid = true;

    setMailError("");
    setPasswordError("");
    setCommonError("");

    if (!email) {
      setMailError(getErrorMessage("E001", "メールアドレス"));
      valid = false;
    } else if (!isValidEmail(email)) {
      setMailError(getErrorMessage("E002", "メールアドレス"));
      valid = false;
    } else if (email.length > MAIL_MAX_LENGTH) {
      setMailError(getErrorMessage("E003", "メールアドレス", MAIL_MAX_LENGTH));
      valid = false;
    }

    if (!password) {
      setPasswordError(getErrorMessage("E001", "パスワード"));
      valid = false;
    } else if (
      password.length < PASSWORD_MIN_LENGTH ||
      password.length > PASSWORD_MAX_LENGTH
    ) {
      setPasswordError(
        getErrorMessage("E004", "パスワード", PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
      );
      valid = false;
    }

    return valid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = await fetchJson("http://localhost:8080/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem("loginUserId", data.id);
      localStorage.setItem("loginUserName", data.name);
      localStorage.setItem("loginUserEmail", data.email);

      navigate("/users");
    } catch (error) {
      if (error?.message) {
        setCommonError(error.message);
      } else {
        setCommonError("サーバーに接続できません。");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">ログイン</h1>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="text"
              maxLength="50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
            />
            {mailError && <p className="error-text">{mailError}</p >}
          </div>

          <div className="input-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              maxLength="16"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
            />
            {passwordError && <p className="error-text">{passwordError}</p >}
          </div>

          {commonError && <p className="error-text">{commonError}</p >}

          <button id="login_button" type="submit" className="main-button">
            ログイン
          </button>
        </form>

        <div className="link-area">
          <Link id="to_register_link" to="/register" className="sub-link">
            新規会員登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;