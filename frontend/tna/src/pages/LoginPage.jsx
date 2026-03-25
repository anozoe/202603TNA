import "../App.css";
import { getErrorMessage } from "../utils/errorUtil";
import "./LoginRegister.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mailError, setMailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const MAIL_MAX_LENGTH = 50;
  const PASSWORD_MIN_LENGTH = 8;
  const PASSWORD_MAX_LENGTH = 16;

  const isValidEmail = (value) => {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(value);
  };

  const mailChecker = (value) => {
    if (!value) {
      setMailError(getErrorMessage("E001", "メールアドレス"));
      return false;
    } else if (!isValidEmail(value)) {
      setMailError(getErrorMessage("E002", "メールアドレス"));
      return false;
    } else if (value.length > MAIL_MAX_LENGTH) {
      setMailError(getErrorMessage("E003", "メールアドレス", MAIL_MAX_LENGTH.toString()));
      return false;
    }
    return true;
  }

  const passwordChecker = (value) => {
    if (!value) {
      setPasswordError(getErrorMessage("E001", "パスワード"));
      return false;
    // } else if (!isValidEmail(value)) {
    //   // TODO: パスワードに形式チェックなんて無いのでは？設計書修正が必要
    //   setPasswordError(getErrorMessage("E002", "パスワード"));
    //   return false;
    } else if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
      setPasswordError(getErrorMessage("E004", "パスワード", PASSWORD_MIN_LENGTH.toString(), PASSWORD_MAX_LENGTH.toString()));
      return false;
    }
    return true;
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    setMailError("");
    setPasswordError("");

    let valid = true;
    if (!mailChecker(email)) valid = false;
    if (!passwordChecker(password)) valid = false;
    if (!valid) return;

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        // TODO:メッセージに追加。設計書修正が必要。そもそも２か所に出す必要はないのでは？
        setMailError("メールアドレスまたはパスワードが違います");
        setPasswordError("メールアドレスまたはパスワードが違います");
        return;
      }

      const data = await response.json();

      localStorage.setItem("loginUserId", data.id);
      localStorage.setItem("loginUserName", data.userName);
      localStorage.setItem("loginUserEmail", data.email);

      // TODO:メッセージに追加と設計書修正が必要
      console.log("ログイン成功:", data);

      navigate("/todo");
    } catch (error) {
      console.error(error);
      // TODO:メッセージに追加と設計書修正が必要。メールの領域に出すのも違和感。
      setMailError("サーバーに接続できません");
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

            {mailError && (
              <p id="mail_error_message" className="error-text">
                {mailError}
              </p >
            )}
          </div>

          <div className="input-group">
            <label htmlFor="password">パスワード</label>

            <input
              id="password"
              type="password"
              maxLength="50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
            />

            {passwordError && (
              <p id="password_error_message" className="error-text">
                {passwordError}
              </p >
            )}
          </div>

          <button
            id="login_button"
            type="submit"
            className="main-button"
          >
            ログイン
          </button>
        </form>

        <div className="link-area">
          <Link
            id="to_register_link"
            to="/register"
            className="sub-link"
          >
            新規会員登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;