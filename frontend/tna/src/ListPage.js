import "./ListPage.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJson } from "./utils/api";

function ListPage({ loginUserName = "User Name", onLogout }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const loginUserId = Number(localStorage.getItem("loginUserId") || 0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
        const data = await fetchJson(`http://localhost:8080/api/users/${yearMonth}`);
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        setMessage(error?.message || "ユーザ一覧の取得に失敗しました。");
      }
    };

    fetchUsers();
  }, []);

  const handleMoveAttendancePage = (user) => {
    navigate("/attendance/view", {
      state: {
        userId: user.id,
        displayName: user.name,
        isReadOnly: true,
      },
    });
  };

  const handleMoveMyAttendancePage = () => {
    const loginUserNameStored = localStorage.getItem("loginUserName") || "自分";

    navigate("/attendance/my", {
      state: {
        userId: loginUserId || 1,
        displayName: loginUserNameStored,
        isReadOnly: false,
      },
    });
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    alert("ログアウト");
  };

  return (
    <div className="list-page">
      <header className="list-header">
        <div className="list-header__title">ユーザ一覧画面</div>
        <div className="list-header__right">
          <span className="list-header__user">{loginUserName}</span>
          <button className="list-header__logout" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </header>

      <main className="list-main">
        <div className="list-top-card">
          <div className="list-top-card__title">勤怠閲覧対象一覧</div>
          <button className="list-my-page-btn" onClick={handleMoveMyAttendancePage}>
            自分の勤怠画面へ
          </button>
        </div>

        {message && <p className="error-text">{message}</p >}

        <div className="list-table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>ユーザID</th>
                <th>氏名</th>
                <th>所属</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isMyself = Number(user.id) === loginUserId;

                return (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.departmentName ?? "-"}</td>
                    <td>
                      {!isMyself && (
                        <button
                          className="list-view-btn"
                          onClick={() => handleMoveAttendancePage(user)}
                        >
                          勤怠実績を見る
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4">ユーザが存在しません。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default ListPage;