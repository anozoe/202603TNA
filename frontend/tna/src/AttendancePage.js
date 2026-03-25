import "./AttendancePage.css";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://localhost:8080/api/attendance";

const WORK_STATUS = Object.freeze({
  NONE: "",
  MORNING_OFF: "2",
  AFTERNOON_OFF: "3",
  SUBSTITUTE_HOLIDAY: "4",
  HOLIDAY: "5",
});

const WORK_STATUS_LABEL = Object.freeze({
  [WORK_STATUS.NONE]: "",
  [WORK_STATUS.MORNING_OFF]: "午前休",
  [WORK_STATUS.AFTERNOON_OFF]: "午後休",
  [WORK_STATUS.SUBSTITUTE_HOLIDAY]: "代休",
  [WORK_STATUS.HOLIDAY]: "休日",
});

const WORK_STATUS_OPTIONS = Object.entries(WORK_STATUS_LABEL).map(
  ([value, label]) => ({
    value,
    label,
  })
);

const YEARS = Array.from({ length: 5 }, (_, i) => 2024 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function AttendancePage({
  userId = 1,
  loginUserName = "User Name",
  displayName = "AA　AA",
  isReadOnly = false,
  onLogout,
  onBack,
}) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [pageMessage, setPageMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const summary = useMemo(() => {
    const totalMinutes = rows.reduce(
      (sum, row) => sum + timeTextToMinutes(row.actualWorkTime || "0:00"),
      0
    );

    const workDays = rows.filter((row) => {
      const isHolidayLike =
        row.workStatus === WORK_STATUS.SUBSTITUTE_HOLIDAY ||
        row.workStatus === WORK_STATUS.HOLIDAY;
      return !isHolidayLike && row.actualWorkTime !== "0:00";
    }).length;

    return {
      totalWorkTime: minutesToTimeText(totalMinutes),
      workDays,
    };
  }, [rows]);

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedYear, selectedMonth]);

const fetchAttendance = async () => {
  setIsLoading(true);
  setPageMessage("");

  try {
    const url = `${API_BASE_URL}?userId=${userId}&year=${selectedYear}&month=${selectedMonth}`;
    console.log("fetch url:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("response status:", response.status);

    const data = await response.json();
    console.log("response data:", data);

    if (!response.ok) {
      throw new Error(data.message || "勤怠情報の取得に失敗しました。");
    }

    const normalizedRows = (data.attendanceRowList || []).map((row, index) => ({
      id: row.id ?? index + 1,
      workDate: row.workDate ?? "",
      startTime: row.startTime ?? "",
      endTime: row.endTime ?? "",
      breakTime: row.breakTime ?? "",
      actualWorkTime: row.actualWorkTime ?? "0:00",
      workStatus: row.workStatus ?? WORK_STATUS.NONE,
    }));

    setRows(normalizedRows);
    setErrors({});
    setPageMessage(data.message || "");
  } catch (error) {
    console.error("fetchAttendance error:", error);
    setPageMessage(`勤怠情報の取得に失敗しました: ${error.message}`);
    setRows(createEmptyMonthRows(selectedYear, selectedMonth));
  } finally {
    setIsLoading(false);
  }
};

  const handleChangeField = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const nextRow = { ...row, [field]: value };

        const isHolidayLike =
          nextRow.workStatus === WORK_STATUS.SUBSTITUTE_HOLIDAY ||
          nextRow.workStatus === WORK_STATUS.HOLIDAY;

        if (!isHolidayLike) {
          nextRow.actualWorkTime = calculateActualWorkTimeText(
            nextRow.startTime,
            nextRow.endTime,
            nextRow.breakTime
          );
        }

        return nextRow;
      })
    );
  };

  const clearRowErrors = (id, baseErrors) => {
    const nextErrors = { ...baseErrors };
    delete nextErrors[`startTime-${id}`];
    delete nextErrors[`endTime-${id}`];
    delete nextErrors[`breakTime-${id}`];
    return nextErrors;
  };

  const handleBlurRow = (id) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        let nextErrors = clearRowErrors(id, errors);

        const isHolidayLike =
          row.workStatus === WORK_STATUS.SUBSTITUTE_HOLIDAY ||
          row.workStatus === WORK_STATUS.HOLIDAY;

        if (isHolidayLike) {
          setErrors(nextErrors);
          return {
            ...row,
            startTime: "",
            endTime: "",
            breakTime: "",
            actualWorkTime: "0:00",
          };
        }

        if (row.startTime && !isValidTime(row.startTime)) {
          nextErrors[`startTime-${id}`] = "※正しい出勤時刻を入力してください";
        }

        if (row.endTime && !isValidTime(row.endTime)) {
          nextErrors[`endTime-${id}`] = "※正しい退勤時刻を入力してください";
        }

        if (row.breakTime && !isValidTime(row.breakTime)) {
          nextErrors[`breakTime-${id}`] = "※正しい休憩時間を入力してください";
        }

        if (
          row.startTime &&
          row.endTime &&
          isValidTime(row.startTime) &&
          isValidTime(row.endTime)
        ) {
          const startMinutes = timeTextToMinutes(row.startTime);
          const endMinutes = timeTextToMinutes(row.endTime);

          if (startMinutes >= endMinutes) {
            nextErrors[`endTime-${id}`] =
              "※退勤時刻は出勤時刻より後に入力してください";
          }
        }

        const actualWorkTime = calculateActualWorkTimeText(
          row.startTime,
          row.endTime,
          row.breakTime
        );

        setErrors(nextErrors);

        return {
          ...row,
          actualWorkTime,
        };
      })
    );
  };

  const handleStatusChange = (id, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const isHolidayLike =
          value === WORK_STATUS.SUBSTITUTE_HOLIDAY ||
          value === WORK_STATUS.HOLIDAY;

        if (isHolidayLike) {
          return {
            ...row,
            workStatus: value,
            startTime: "",
            endTime: "",
            breakTime: "",
            actualWorkTime: "0:00",
          };
        }

        return {
          ...row,
          workStatus: value,
          actualWorkTime: calculateActualWorkTimeText(
            row.startTime,
            row.endTime,
            row.breakTime
          ),
        };
      })
    );

    setErrors((prev) => clearRowErrors(id, prev));
  };

  const validateAllRows = () => {
    const nextErrors = {};

    rows.forEach((row) => {
      const isHolidayLike =
        row.workStatus === WORK_STATUS.SUBSTITUTE_HOLIDAY ||
        row.workStatus === WORK_STATUS.HOLIDAY;

      if (isHolidayLike) {
        return;
      }

      if (row.startTime && !isValidTime(row.startTime)) {
        nextErrors[`startTime-${row.id}`] = "※正しい出勤時刻を入力してください";
      }

      if (row.endTime && !isValidTime(row.endTime)) {
        nextErrors[`endTime-${row.id}`] = "※正しい退勤時刻を入力してください";
      }

      if (row.breakTime && !isValidTime(row.breakTime)) {
        nextErrors[`breakTime-${row.id}`] = "※正しい休憩時間を入力してください";
      }

      if (
        row.startTime &&
        row.endTime &&
        isValidTime(row.startTime) &&
        isValidTime(row.endTime)
      ) {
        const startMinutes = timeTextToMinutes(row.startTime);
        const endMinutes = timeTextToMinutes(row.endTime);

        if (startMinutes >= endMinutes) {
          nextErrors[`endTime-${row.id}`] =
            "※退勤時刻は出勤時刻より後に入力してください";
        }
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length > 0;
  };

  const handleUpdate = async () => {
    if (isReadOnly) return;

    const hasValidationError = validateAllRows();
    if (hasValidationError) {
      setPageMessage("入力内容に誤りがあります。");
      return;
    }

    setIsLoading(true);
    setPageMessage("");

    try {
      const requestBody = {
        userId,
        year: selectedYear,
        month: selectedMonth,
        attendanceRowList: rows.map((row) => ({
          id: row.id,
          workDate: row.workDate,
          startTime: row.startTime,
          endTime: row.endTime,
          breakTime: row.breakTime,
          actualWorkTime: row.actualWorkTime,
          workStatus: row.workStatus,
        })),
      };

      const response = await fetch(API_BASE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "更新に失敗しました。");
      }

      const normalizedRows = (data.attendanceRowList || []).map((row, index) => ({
        id: row.id ?? index + 1,
        workDate: row.workDate ?? "",
        startTime: row.startTime ?? "",
        endTime: row.endTime ?? "",
        breakTime: row.breakTime ?? "",
        actualWorkTime: row.actualWorkTime ?? "0:00",
        workStatus: row.workStatus ?? WORK_STATUS.NONE,
      }));

      setRows(normalizedRows);
      setErrors({});
      setPageMessage(data.message || "更新しました。");
    } catch (error) {
      console.error(error);
      setPageMessage(error.message || "更新に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    alert("一覧へ戻る");
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    alert("ログアウト");
  };

  return (
    <div className="attendance-page">
      <header className="attendance-header">
        <div className="attendance-header__title">
          {isReadOnly ? "勤怠実績画面（他人閲覧用）" : "勤怠実績画面"}
        </div>
        <div className="attendance-header__right">
          <span className="attendance-header__user">{loginUserName}</span>
          <button
            className="attendance-header__logout"
            onClick={handleLogout}
            disabled={isLoading}
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="attendance-main">
        <div className="attendance-top-card">
          <div className="attendance-top-card__left">
            <div className="attendance-user-row">
              <span className="attendance-user-label">氏名</span>
              <span className="attendance-user-name">{displayName}</span>
            </div>

            <div className="attendance-user-row attendance-user-row--sub">
              <span className="attendance-user-sub-label">閲覧対象ユーザーID</span>
              <span className="attendance-user-sub-value">{userId}</span>
            </div>

            <div className="attendance-month-row">
              <label className="attendance-label">対象月</label>

              <select
                className="attendance-month-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                disabled={isLoading}
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </select>

              <select
                className="attendance-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                disabled={isLoading}
              >
                {MONTHS.map((month) => (
                  <option key={month} value={month}>
                    {month}月
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="attendance-top-card__center">
            <div className="attendance-summary-line">
              実働時間合計：{summary.totalWorkTime}
            </div>
            <div className="attendance-summary-line">
              出勤日数：{summary.workDays}日
            </div>
            <div className="attendance-target-month-text">
              {selectedYear}年{String(selectedMonth).padStart(2, "0")}月
            </div>
            {isReadOnly && (
              <div className="attendance-readonly-badge">閲覧専用</div>
            )}
          </div>

          <div className="attendance-top-card__right">
            <button
              className="attendance-back-btn"
              onClick={handleBack}
              disabled={isLoading}
            >
              一覧へ戻る
            </button>

            {!isReadOnly && (
              <button
                className="attendance-update-btn"
                onClick={handleUpdate}
                disabled={isLoading}
              >
                {isLoading ? "処理中" : "更新"}
              </button>
            )}
          </div>
        </div>

        {pageMessage && <div className="attendance-page-message">{pageMessage}</div>}

        <div className="attendance-table-wrap">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>日付</th>
                <th>出勤</th>
                <th>退勤</th>
                <th>休憩時間</th>
                <th>実働</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isHolidayLike =
                  row.workStatus === WORK_STATUS.SUBSTITUTE_HOLIDAY ||
                  row.workStatus === WORK_STATUS.HOLIDAY;

                return (
                  <tr
                    key={`${row.workDate}-${row.id}`}
                    className={isHolidayLike ? "holiday-row" : ""}
                  >
                    <td>{formatDate(row.workDate)}</td>

                    <td>
                      <input
                        type="text"
                        className="attendance-input"
                        value={row.startTime}
                        placeholder=""
                        disabled={true}
                        onChange={(e) =>
                          handleChangeField(row.id, "startTime", e.target.value)
                        }
                        onBlur={() => handleBlurRow(row.id)}
                      />
                      {!isReadOnly && errors[`startTime-${row.id}`] && (
                        <div className="attendance-error">
                          {errors[`startTime-${row.id}`]}
                        </div>
                      )}
                    </td>

                    <td>
                      <input
                        type="text"
                        className="attendance-input"
                        value={row.endTime}
                        placeholder=""
                        disabled={true}
                        onChange={(e) =>
                          handleChangeField(row.id, "endTime", e.target.value)
                        }
                        onBlur={() => handleBlurRow(row.id)}
                      />
                      {!isReadOnly && errors[`endTime-${row.id}`] && (
                        <div className="attendance-error">
                          {errors[`endTime-${row.id}`]}
                        </div>
                      )}
                    </td>

                    <td>
                      <input
                        type="text"
                        className="attendance-input"
                        value={row.breakTime}
                        placeholder=""
                        disabled={true}
                        onChange={(e) =>
                          handleChangeField(row.id, "breakTime", e.target.value)
                        }
                        onBlur={() => handleBlurRow(row.id)}
                      />
                      {!isReadOnly && errors[`breakTime-${row.id}`] && (
                        <div className="attendance-error">
                          {errors[`breakTime-${row.id}`]}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="attendance-actual-time">
                        {row.actualWorkTime}
                      </span>
                    </td>

                    <td>
                      <select
                        className="attendance-select"
                        value={row.workStatus}
                        disabled={true}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        onBlur={() => handleBlurRow(row.id)}
                      >
                        {WORK_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function createEmptyMonthRows(year, month) {
  const endOfMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: endOfMonth }, (_, index) => {
    const day = index + 1;
    const workDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return {
      id: day,
      workDate,
      startTime: "",
      endTime: "",
      breakTime: "",
      actualWorkTime: "0:00",
      workStatus: WORK_STATUS.NONE,
    };
  });
}

function isValidTime(value) {
  return /^([0-1]?\d|2[0-3]):[0-5]\d$/.test(value);
}

function timeTextToMinutes(value) {
  if (!value || !value.includes(":")) return 0;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeText(minutes) {
  if (!minutes || minutes < 0) return "0:00";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

function calculateActualWorkTimeText(startTime, endTime, breakTime) {
  if (
    !startTime ||
    !endTime ||
    !breakTime ||
    !isValidTime(startTime) ||
    !isValidTime(endTime) ||
    !isValidTime(breakTime)
  ) {
    return "0:00";
  }

  const startMinutes = timeTextToMinutes(startTime);
  const endMinutes = timeTextToMinutes(endTime);
  const breakMinutes = timeTextToMinutes(breakTime);

  const diff = endMinutes - startMinutes - breakMinutes;
  return diff > 0 ? minutesToTimeText(diff) : "0:00";
}

function formatDate(dateText) {
  if (!dateText) return "";
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return dateText;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const week = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];

  return `${month}/${day}（${week}）`;
}

export default AttendancePage;