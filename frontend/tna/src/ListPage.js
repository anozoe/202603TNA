import "./ListPage.css";
import { useNavigate } from "react-router-dom";

const USER_LIST = [
  { userId: 1, userName: "山田", departmentName: "1" },
  { userId: 2, userName: "田中", departmentName: "2" },
  { userId: 3, userName: "佐藤", departmentName: "3" },
  { userId: 4, userName: "鈴木", departmentName: "4" },
  { userId: 5, userName: "高橋", departmentName: "5" },
];

function ListPage({ loginUserName = "User Name", onLogout }) {
  const navigate = useNavigate();

  const handleMoveAttendancePage = (user) => {
    navigate("/attendance/view", {
      state: {
        userId: user.userId,
        displayName: user.userName,
        isReadOnly: true,
      },
    });
  };

  const handleMoveMyAttendancePage = () => {
    navigate("/attendance/my", {
      state: {
        userId: 1,
        displayName: "自分",
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
              {USER_LIST.map((user) => (
                <tr key={user.userId}>
                  <td>{user.userId}</td>
                  <td>{user.userName}</td>
                  <td>{user.departmentName}</td>
                  <td>
                    <button
                      className="list-view-btn"
                      onClick={() => handleMoveAttendancePage(user)}
                    >
                      勤怠実績を見る
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default ListPage;