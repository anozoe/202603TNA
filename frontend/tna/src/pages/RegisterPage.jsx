import { registerApi } from "../API/Login";
import "../App.css";
import { getErrorMessage } from "../utils/errorUtil";
import "./LoginRegister.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [mailError, setMailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // const nameRegex = /^[A-Za-z0-9._%+-]+$/;
  const nameRegex = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF01-\uFF60]+$/;
  const isValidEmail = (value) => {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(value);
  };

  const MAIL_MAX_LENGTH = 50;
  const PASSWORD_MIN_LENGTH = 8;
  const PASSWORD_MAX_LENGTH = 16;

  const isValidPassword = (value) => {
    if (value.length < 8) return false;

    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);

    const typeCount = [hasLetter, hasNumber, hasSymbol].filter(Boolean).length;

    return typeCount >= 2;
  };

  const nameChecker = (value) => {
    if (!value) {
      setNameError(getErrorMessage("E001", "ユーザ名"));
      return false;
    } else if (!nameRegex.test(value)) {
      setNameError(getErrorMessage("E002", "ユーザ名"));
      return false;
    } else if (value.length > 30) {
      setNameError(getErrorMessage("E003", "ユーザ名", "30"));
      return false;
    }
    return true;
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
    } else if (!isValidPassword(value)) {
      setPasswordError(getErrorMessage("E002", "パスワード"));
      return false;
    } else if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
      setPasswordError(getErrorMessage("E004", "パスワード", PASSWORD_MIN_LENGTH.toString(), PASSWORD_MAX_LENGTH.toString()));
      return false;
    }
    return true;
  }
    
  const handleRegister = async (e) => {
    e.preventDefault();

    setNameError("");
    setMailError("");
    setPasswordError("");

    let valid = true;
    if (!nameChecker(userName)) valid = false;
    if (!mailChecker(email)) valid = false;
    if (!passwordChecker(password)) valid = false;
    if (!valid) return;

    try {
      const response = await registerApi(userName, email, password);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("登録失敗:", errorText);
        alert("ユーザ登録に失敗しました");
        return;
      }

      const data = await response.json();
      console.log("登録成功:", data);

      navigate("/");
    } catch (error) {
      // TODO:メールアドレス重複エラーの実装が必要
      // setMailError(getErrorMessage("E005", "メールアドレス"));

      console.error(error);
      alert("サーバーに接続できません");
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
          ※パスワードは8文字以上で入力してください。<br />
          英字・数字・記号のうち2種類以上を含める必要があります。
        </p >

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="user_name">ユーザ名</label>

            <input
              id="user_name"
              type="text"
              maxLength="30"
              value={userName}
              onChange={(e) => {
                const trimmed = e.target.value.replace(/[\s\u3000]/g, "");
                setUserName(trimmed);
              }}
            />

            {nameError && (
              <p id="name_error_message" className="error-text">
                {nameError}
              </p >
            )}
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
            />

            {passwordError && (
              <p id="password_error_message" className="error-text">
                {passwordError}
              </p >
            )}
          </div>

          <button
            id="register_button"
            type="submit"
            className="main-button"
          >
            登録
          </button>
        </form>

        <div className="link-area">
          <Link
            id="to_login_link"
            to="/"
            className="sub-link"
          >
            ログインへ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;