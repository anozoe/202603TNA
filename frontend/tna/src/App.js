import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AttendancePage from "./AttendancePage";
import ListPage from "./ListPage";

function AttendanceMyPageWrapper({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {
    userId: 1,
    displayName: "自分",
    isReadOnly: false,
  };

  return (
    <AttendancePage
      userId={state.userId}
      loginUserName="User Name"
      displayName={state.displayName}
      isReadOnly={state.isReadOnly}
      onLogout={() => alert("ログアウト")}
      onBack={() => navigate("/users")}
    />
  );
}

function AttendanceViewPageWrapper({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {
    userId: 2,
    displayName: "他人ユーザ",
    isReadOnly: true,
  };

  return (
    <AttendancePage
      userId={state.userId}
      loginUserName={localStorage.getItem("loginUserName")} 
      displayName={state.displayName}
      isReadOnly={state.isReadOnly}
      onLogout={onLogout}
      onBack={() => navigate("/users")}
    />
  );
}

function App() {
  const navigate =useNavigate();
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
            loginUserName={localStorage.getItem("loginUserName")}  
            onLogout={handleLogout} 
          />
        }
      />
      <Route path="/attendance/my" element={<AttendanceMyPageWrapper />} />
      <Route path="/attendance/view" element={<AttendanceViewPageWrapper />} />
      <Route path="*" element={<Navigate to="/" replace />} />  
    </Routes>
  );
}

export default App;