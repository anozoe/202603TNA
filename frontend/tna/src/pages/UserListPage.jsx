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
  const [commonError, setCommonError] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    getUserList(selectedMonth)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];

        const sorted = [...list].sort((a, b) => {
          if (a.userId === loginUserId) return -1;
          if (b.userId === loginUserId) return 1;
          return 0;
        });

        setUserList(sorted);
        setTotalPages(Math.ceil(list.length / size));
        setTotalElements(list.length);
        setCommonError("");
      })
      .catch((error) => {
        setUserList([]);
        setTotalPages(0);
        setTotalElements(0);
        setCommonError(error.message || "サーバーに接続できません");
      });
  }, [selectedMonth, page, size, loginUserId]);

  const handleMoveAttendancePage = (user) => {
    navigate("/attendance", {
      state: {
        userId: user.userId,
        displayName: user.name,
        isReadOnly: user.userId === loginUserId ? false : true,
        selectedYearMonth: selectedMonth,
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

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page + 1 < totalPages) {
      setPage(page + 1);
    }
  };

  const handleChangeMonth = (e) => {
    setSelectedMonth(Number(e.target.value));
    setPage(0);
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
            <select value={selectedMonth} onChange={handleChangeMonth}>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {formatMonth(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {commonError && <p className="error-text">{commonError}</p >}

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
              {userList.length === 0 && (
                <tr>
                  <td colSpan="4">データがありません。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="list-pagination">
          <button onClick={handlePreviousPage} disabled={page === 0}>
            前へ
          </button>
          <span>
            {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={page + 1 >= totalPages}>
            次へ
          </button>
          <span className="list-pagination__count">総件数：{totalElements}件</span>
        </div>
      </main>
    </div>
  );
}

export default ListPage;
