import { useEffect, useState } from "react";
import "./UserListPage.css";
import { useNavigate } from "react-router-dom";
import { getUserList } from "../API/User";


const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyymm = d.getFullYear() * 100 + (d.getMonth() + 1);
    options.push(yyyymm);
  }
  
  return options;
};
const monthOptions = generateMonthOptions();
const formatMonth = (yyyymm) => {
  const year = Math.floor(yyyymm / 100);
  const month = yyyymm % 100;
  return `${year}年${month}月`;
};

const formatWorkTime = (time) => {
  if (!time) return "0:00";
  return time.slice(0, -3); 
};

function ListPage({ onLogout }) {
  const loginUserId = Number(localStorage.getItem("loginUserId"));
  const loginUserName = localStorage.getItem("loginUserName");
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);

  useEffect(() => {
    getUserList(selectedMonth)
      .then(data => setUserList(data));
  }, [selectedMonth]);


  const handleMoveAttendancePage = (user) => {
    navigate("/attendance", {
      state: {
        userId: user.id,
        displayName: user.name,
        isReadOnly: user.id === loginUserId ? false : true,
        selectedYearMonth: selectedMonth,
      },
    });
  }; 

  useEffect(() => {
    getUserList(selectedMonth)
      .then(data => {
        const sorted = [...data].sort((a, b) => {
          if (a.userId === loginUserId) return -1;
          if (b.userId === loginUserId) return 1;
          return 0;
        });
        setUserList(sorted);
      });
  }, [selectedMonth]);

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
        <div className="list-header__title">従業員一覧</div>
        <div className="list-header__right">
          <span className="list-header__user">{loginUserName}</span>
          <button className="list-header__logout" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </header>

      <main className="list-main">
        <div>
          <div className="list-month-selector">
            <span className="list-month-selector__label">対象月</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
          </div>
          {/* <button className="list-my-page-btn" onClick={handleMoveMyAttendancePage}>
            自分の勤怠画面へ
          </button> */}
        </div>

        <div className="list-table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>氏名</th>
                <th>出勤日数</th>
                <th>総勤務時間</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user) => (
                <tr 
                  key={user.userId}
                  className={user.userId === loginUserId ? "highlight-row" : ""}
                >
                    <td>{user.name}</td>
                    <td>{user.workDays}</td>
                    <td>{formatWorkTime(user.workTimeTotal)}</td>
                    <td>
                      <button
                        className="list-view-btn"
                        onClick={() => handleMoveAttendancePage(user)}
                      >
                        詳細
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