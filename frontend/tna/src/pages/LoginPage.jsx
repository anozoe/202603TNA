import { loginApi } from "../API/Login";
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
  const [loginError, setLoginError] = useState("");
  const [connectError, setConnectError] = useState("");

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
    } else if (!isValidPassword(value)) {
      setPasswordError(getErrorMessage("E002", "パスワード"));
      return false;
    } else if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
      setPasswordError(getErrorMessage("E004", "パスワード", PASSWORD_MIN_LENGTH.toString(), PASSWORD_MAX_LENGTH.toString()));
      return false;
    }
    return true;
  }

  const isValidPassword = (value) => {
    const hasLetter = /[A-Za-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);

    const typeCount = [hasLetter, hasNumber, hasSymbol].filter(Boolean).length;

    setMailError("");
    setPasswordError("");
    // setCommonError("");

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
      return false;
    } else if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) {
      setPasswordError(getErrorMessage("E004", "パスワード", PASSWORD_MIN_LENGTH.toString(), PASSWORD_MAX_LENGTH.toString()));
      return false;
    } else if (!isValidPassword(value)) {
      setPasswordError(getErrorMessage("E002", "パスワード"));
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setMailError("");
    setPasswordError("");
    setLoginError("");
    setConnectError("");

    let valid = true;
    if (!mailChecker(email)) valid = false;
    if (!passwordChecker(password)) valid = false;
    if (!valid) return;

    try {
     const response = await loginApi(email, password);

      if (!response.ok) {
        setLoginError(getErrorMessage("E008", "メールアドレス", "パスワード"));
        return;
      }

      const data = await response.json();

      localStorage.setItem("loginUserId", data.id);
      localStorage.setItem("loginUserName", data.name);
      localStorage.setItem("loginUserEmail", data.email);

      navigate("/users");
    } catch (error) {
      console.error(error);
      // TODO:メッセージに追加と設計書修正が必要。メールの領域に出すのも違和感。
      setConnectError(getErrorMessage("E007", "サーバー"));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">ログイン</h1>
        {loginError && (
          <p id="login_error_message" className="error-text">
            {loginError}
          </p>
        )}
        {connectError && (
          <p id="connect_error_message" className="error-text">
            {connectError}
          </p>
        )}

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
              </p>
            )}
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

            {passwordError && (
              <p id="password_error_message" className="error-text">
                {passwordError}
              </p>
            )}
          </div>

          {/* {commonError && <p className="error-text">{commonError}</p >} */}

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