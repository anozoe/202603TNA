import "./App.css";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AttendancePage from "./AttendancePage";
import ListPage from "./ListPage";

function AttendancePageWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const loginUserId = Number(localStorage.getItem("loginUserId") || 1);
  const loginUserName = localStorage.getItem("loginUserName") || "User Name";

  const state = location.state || {
    userId: loginUserId,
    displayName: loginUserName,
    isReadOnly: false,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  };

  return (
    <AttendancePage
      userId={state.userId}
      loginUserName={loginUserName}
      displayName={state.displayName}
      isReadOnly={state.isReadOnly}
      onLogout={() => {
        localStorage.clear();
        navigate("/");
      }}
      onBack={() => navigate("/users")}
    />
  );
}

function UsersPageWrapper() {
  const navigate = useNavigate();
  const loginUserName = localStorage.getItem("loginUserName") || "User Name";

  return (
    <ListPage
      loginUserName={loginUserName}
      onLogout={() => {
        localStorage.clear();
        navigate("/");
      }}
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/users" element={<UsersPageWrapper />} />
      <Route path="/attendance" element={<AttendancePageWrapper />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;