import "./App.css";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AttendancePage from "./AttendancePage";
import ListPage from "./pages/UserListPage";

function AttendancePageWrapper({ onLogout }) {
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
      onLogout={onLogout}
      onBack={() => navigate("/users")}
    />
  );
}

function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loginUserId");
    localStorage.removeItem("loginUserName");
    localStorage.removeItem("loginUserEmail");
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/users"
        element={
          <ListPage
            loginUserName={localStorage.getItem("loginUserName") || "User Name"}
            onLogout={handleLogout}
          />
        }
      />
      <Route
        path="/attendance"
        element={<AttendancePageWrapper onLogout={handleLogout} />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;