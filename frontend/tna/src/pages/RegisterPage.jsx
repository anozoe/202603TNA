import "../App.css";
import "./LoginRegister.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getErrorMessage } from "../utils/errorUtil";
import { fetchJson } from "../utils/api";

const NAME_MAX_LENGTH = 50;
const MAIL_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 16;

function isValidEmail(value) {
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return regex.test(value);
}

function isValidUserName(value) {
  const regex = /^[A-Za-z0-9_]+$/;
  return regex.test(value);
}

function isValidPassword(value) {
  const hasLetter = /[A-Za-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  const typeCount = [hasLetter, hasNumber, hasSymbol].filter(Boolean).length;
  return typeCount >= 2;
}

function RegisterPage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [mailError, setMailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [commonError, setCommonError] = useState("");

  const validate = () => {
    let valid = true;

    setNameError("");
    setMailError("");
    setPasswordError("");
    setCommonError("");

    if (!userName) {
      setNameError(getErrorMessage("E001", "ユーザ名"));
      valid = false;
    } else if (userName.length > NAME_MAX_LENGTH) {
      setNameError(getErrorMessage("E003", "ユーザ名", NAME_MAX_LENGTH));
      valid = false;
    } else if (!isValidUserName(userName)) {
      setNameError(getErrorMessage("E002", "ユーザ名"));
      valid = false;
    }

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
        getErrorMessage(
          "E004",
          "パスワード",
          PASSWORD_MIN_LENGTH,
          PASSWORD_MAX_LENGTH
        )
      );
      valid = false;
    } else if (!isValidPassword(password)) {
      setPasswordError(getErrorMessage("E002", "パスワード"));
      valid = false;
    }

    return valid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await fetchJson("http://localhost:8080/api/users/register", {
        method: "POST",
        body: JSON.stringify({
          name: userName,
          email,
          password,
        }),
      });

      alert("ユーザ登録成功");
      navigate("/");
    } catch (error) {
      if (error?.messageId === "E005") {
        setMailError(error.message);
      } else if (error?.message) {
        setCommonError(error.message);
      } else {
        setCommonError("サーバーに接続できません。");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">ユーザ登録</h1>

        <p className="auth-subtitle">
          名前、メールアドレス、パスワードを入力してください
        </p >

        <p className="password-rule">
          ※パスワードは8文字以上16文字以下で入力してください。
          <br />
          英字・数字・記号のうち2種類以上を含める必要があります。
        </p >

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="user_name">ユーザ名</label>
            <input
              id="user_name"
              type="text"
              maxLength="50"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            {nameError && <p className="error-text">{nameError}</p >}
          </div>

          <div className="input-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="text"
              maxLength="50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
            {passwordError && <p className="error-text">{passwordError}</p >}
          </div>

          {commonError && <p className="error-text">{commonError}</p >}

          <button type="submit" className="main-button">
            登録
          </button>
        </form>

        <div className="link-area">
          <Link to="/" className="sub-link">
            ログイン画面はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;