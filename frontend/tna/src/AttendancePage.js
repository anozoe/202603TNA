import "./AttendancePage.css";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

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

const WORK_STATUS_OPTIONS = [
  { value: WORK_STATUS.NONE, label: "" },
  { value: WORK_STATUS.MORNING_OFF, label: "午前休" },
  { value: WORK_STATUS.AFTERNOON_OFF, label: "午後休" },
  { value: WORK_STATUS.SUBSTITUTE_HOLIDAY, label: "代休" },
  { value: WORK_STATUS.HOLIDAY, label: "休日" },
];

const YEAR_MONTH_OPTIONS = Array.from({ length: 5 }, (_, yearIndex) => {
  const year = 2024 + yearIndex;
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const month = monthIndex + 1;
    return {
      value: `${year}-${String(month).padStart(2, "0")}`,
      year,
      month,
      label: `${year}年${String(month).padStart(2, "0")}月`,
    };
  });
}).flat();

function AttendancePage({
  userId = 1,
  loginUserName = "User Name",
  displayName = "AA　AA",
  isReadOnly = false,
  onLogout,
  onBack,
}) {
  const location = useLocation();
  const state = location.state || {};

  const today = new Date();

const selectedYearMonth = state.selectedYearMonth;
const initialYear =
  typeof selectedYearMonth === "number"
    ? Math.floor(selectedYearMonth / 100)
    : state.year || today.getFullYear();

const initialMonth =
  typeof selectedYearMonth === "number"
    ? selectedYearMonth % 100
    : state.month || (today.getMonth() + 1);

const [selectedYear, setSelectedYear] = useState(initialYear);
const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [pageMessage, setPageMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedYearMonthValue = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

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

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      const normalizedRows = (data.attendanceRowList || []).map((row, index) =>
        normalizeRowForDisplay({
          id: row.id ?? index + 1,
          workDate: row.workDate ?? "",
          startTime: row.startTime ?? "",
          endTime: row.endTime ?? "",
          breakTime: row.breakTime ?? "",
          actualWorkTime: row.actualWorkTime ?? "0:00",
          workStatus: normalizeWorkStatus(row.workStatus),
        })
      );

      setRows(normalizedRows);
      setErrors({});
      setPageMessage(data.message || "");
    } catch (error) {
      setRows(createEmptyMonthRows(selectedYear, selectedMonth));
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearMonthChange = (value) => {
    const [year, month] = value.split("-").map(Number);
    setSelectedYear(year);
    setSelectedMonth(month);
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

  const handleFocusField = (id, field) => {
    if (isReadOnly) return;

    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        if (row[field] !== "0:00") return row;
        return { ...row, [field]: "" };
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

        const nextErrors = clearRowErrors(id, errors);

        const normalizedStart = normalizeTimeForEdit(row.startTime);
        const normalizedEnd = normalizeTimeForEdit(row.endTime);
        const normalizedBreak = normalizeTimeForEdit(row.breakTime);

        const isHolidayLike =
          row.workStatus === WORK_STATUS.SUBSTITUTE_HOLIDAY ||
          row.workStatus === WORK_STATUS.HOLIDAY;

        if (isHolidayLike) {
          setErrors(nextErrors);
          return normalizeRowForDisplay({
            ...row,
            startTime: "",
            endTime: "",
            breakTime: "",
            actualWorkTime: "0:00",
          });
        }

        const updatedErrors = { ...nextErrors };

        if (normalizedStart !== "0:00" && !isValidTime(normalizedStart)) {
          updatedErrors[`startTime-${id}`] = "※正しい出勤時刻を入力してください";
        }

        if (normalizedEnd !== "0:00" && !isValidTime(normalizedEnd)) {
          updatedErrors[`endTime-${id}`] = "※正しい退勤時刻を入力してください";
        }

        if (normalizedBreak !== "0:00" && !isValidTime(normalizedBreak)) {
          updatedErrors[`breakTime-${id}`] = "※正しい休憩時間を入力してください";
        }

        setErrors(updatedErrors);

        return normalizeRowForDisplay({
          ...row,
          startTime: normalizedStart,
          endTime: normalizedEnd,
          breakTime: normalizedBreak,
          actualWorkTime: calculateActualWorkTimeText(
            normalizedStart,
            normalizedEnd,
            normalizedBreak
          ),
        });
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
          return normalizeRowForDisplay({
            ...row,
            workStatus: value,
            startTime: "",
            endTime: "",
            breakTime: "",
            actualWorkTime: "0:00",
          });
        }

        return normalizeRowForDisplay({
          ...row,
          workStatus: value,
          actualWorkTime: calculateActualWorkTimeText(
            row.startTime,
            row.endTime,
            row.breakTime
          ),
        });
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

      if (row.startTime !== "0:00" && !isValidTime(row.startTime)) {
        nextErrors[`startTime-${row.id}`] = "※正しい出勤時刻を入力してください";
      }

      if (row.endTime !== "0:00" && !isValidTime(row.endTime)) {
        nextErrors[`endTime-${row.id}`] = "※正しい退勤時刻を入力してください";
      }

      if (row.breakTime !== "0:00" && !isValidTime(row.breakTime)) {
        nextErrors[`breakTime-${row.id}`] = "※正しい休憩時間を入力してください";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length > 0;
  };

  const handleUpdate = async () => {
    if (isReadOnly) return;

    const hasValidationError = validateAllRows();
    if (hasValidationError) {
      setPageMessage("更新ができませんでした。");
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
          startTime: sanitizeTimeForSave(row.startTime),
          endTime: sanitizeTimeForSave(row.endTime),
          breakTime: sanitizeTimeForSave(row.breakTime),
          actualWorkTime: row.actualWorkTime || "0:00",
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
        throw new Error(data.message || "更新ができませんでした。");
      }

      const normalizedRows = (data.attendanceRowList || []).map((row, index) =>
        normalizeRowForDisplay({
          id: row.id ?? index + 1,
          workDate: row.workDate ?? "",
          startTime: row.startTime ?? "",
          endTime: row.endTime ?? "",
          breakTime: row.breakTime ?? "",
          actualWorkTime: row.actualWorkTime ?? "0:00",
          workStatus: normalizeWorkStatus(row.workStatus),
        })
      );

      setRows(normalizedRows);
      setErrors({});
    } catch (error) {
      setPageMessage(error.message || "更新ができませんでした。");
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

            <div className="attendance-month-row">
              <label className="attendance-label">対象月</label>
              <select
                className="attendance-month-select"
                value={selectedYearMonthValue}
                onChange={(e) => handleYearMonthChange(e.target.value)}
                disabled={isLoading}
              >
                {YEAR_MONTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                const isWeekend = isWeekendDate(row.workDate);

                return (
                  <tr
                    key={`${row.workDate}-${row.id}`}
                    className={isWeekend || isHolidayLike ? "holiday-row" : ""}
                  >
                    <td>{formatDate(row.workDate)}</td>

                    <td>
                      {isReadOnly ? (
                        row.startTime ? (
                          <span className="attendance-label-value">{row.startTime}</span>
                        ) : null
                      ) : isHolidayLike ? null : (
                        <>
                          <input
                            type="text"
                            className="attendance-input"
                            value={row.startTime}
                            onFocus={() => handleFocusField(row.id, "startTime")}
                            onChange={(e) =>
                              handleChangeField(row.id, "startTime", e.target.value)
                            }
                            onBlur={() => handleBlurRow(row.id)}
                          />
                          {errors[`startTime-${row.id}`] && (
                            <div className="attendance-error">
                              {errors[`startTime-${row.id}`]}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td>
                      {isReadOnly ? (
                        row.endTime ? (
                          <span className="attendance-label-value">{row.endTime}</span>
                        ) : null
                      ) : isHolidayLike ? null : (
                        <>
                          <input
                            type="text"
                            className="attendance-input"
                            value={row.endTime}
                            onFocus={() => handleFocusField(row.id, "endTime")}
                            onChange={(e) =>
                              handleChangeField(row.id, "endTime", e.target.value)
                            }
                            onBlur={() => handleBlurRow(row.id)}
                          />
                          {errors[`endTime-${row.id}`] && (
                            <div className="attendance-error">
                              {errors[`endTime-${row.id}`]}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td>
                      {isReadOnly ? (
                        row.breakTime ? (
                          <span className="attendance-label-value">{row.breakTime}</span>
                        ) : null
                      ) : isHolidayLike ? null : (
                        <>
                          <input
                            type="text"
                            className="attendance-input"
                            value={row.breakTime}
                            onFocus={() => handleFocusField(row.id, "breakTime")}
                            onChange={(e) =>
                              handleChangeField(row.id, "breakTime", e.target.value)
                            }
                            onBlur={() => handleBlurRow(row.id)}
                          />
                          {errors[`breakTime-${row.id}`] && (
                            <div className="attendance-error">
                              {errors[`breakTime-${row.id}`]}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td>
                      <span className="attendance-actual-time">{row.actualWorkTime}</span>
                    </td>

                    <td>
                      {isReadOnly ? (
                        <span className="attendance-label-value">
                          {WORK_STATUS_LABEL[row.workStatus] ?? ""}
                        </span>
                      ) : (
                        <select
                        className="attendance-select"
                        value={row.workStatus}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                        onBlur={() => handleBlurRow(row.id)}
                      >
                        {WORK_STATUS_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            disabled={option.value === WORK_STATUS.NONE}
                            hidden={option.value === WORK_STATUS.NONE}
                          >
                            {option.label}
                          </option>
                        ))}
                        </select>
                      )}
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

function normalizeRowForDisplay(row) {
  const normalizedStatus = normalizeWorkStatus(row.workStatus);

  const hasWorkedTime =
    sanitizeTimeForSave(row.startTime) !== "" ||
    sanitizeTimeForSave(row.endTime) !== "" ||
    sanitizeTimeForSave(row.breakTime) !== "" ||
    (row.actualWorkTime ?? "0:00") !== "0:00";

  const weekend = isWeekendDate(row.workDate);

  let displayStatus = normalizedStatus;

  if (
    hasWorkedTime &&
    normalizedStatus !== WORK_STATUS.MORNING_OFF &&
    normalizedStatus !== WORK_STATUS.AFTERNOON_OFF &&
    normalizedStatus !== WORK_STATUS.SUBSTITUTE_HOLIDAY &&
    normalizedStatus !== WORK_STATUS.HOLIDAY
  ) {
    displayStatus = WORK_STATUS.NONE;
  }

  if (!hasWorkedTime && displayStatus === WORK_STATUS.NONE && weekend) {
    displayStatus = WORK_STATUS.HOLIDAY;
  }

  if (
    displayStatus === WORK_STATUS.SUBSTITUTE_HOLIDAY ||
    displayStatus === WORK_STATUS.HOLIDAY
  ) {
    return {
      ...row,
      startTime: "",
      endTime: "",
      breakTime: "",
      actualWorkTime: "0:00",
      workStatus: displayStatus,
    };
  }

  return {
    ...row,
    startTime: normalizeTimeForView(row.startTime),
    endTime: normalizeTimeForView(row.endTime),
    breakTime: normalizeTimeForView(row.breakTime),
    actualWorkTime: normalizeTimeForView(row.actualWorkTime),
    workStatus: displayStatus,
  };
}

function normalizeWorkStatus(workStatus) {
  const validValues = new Set(Object.values(WORK_STATUS));
  return validValues.has(workStatus) ? workStatus : WORK_STATUS.NONE;
}

function normalizeTimeForView(value) {
  if (value == null || value === "") {
    return "0:00";
  }
  return value;
}

function normalizeTimeForEdit(value) {
  if (value == null || value === "") {
    return "0:00";
  }
  return value;
}

function sanitizeTimeForSave(value) {
  if (value == null || value === "" || value === "0:00") {
    return "";
  }
  return value;
}

function createEmptyMonthRows(year, month) {
  const endOfMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: endOfMonth }, (_, index) => {
    const day = index + 1;
    const workDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return normalizeRowForDisplay({
      id: day,
      workDate,
      startTime: "0:00",
      endTime: "0:00",
      breakTime: "0:00",
      actualWorkTime: "0:00",
      workStatus: WORK_STATUS.NONE,
    });
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
  const normalizedStart = sanitizeTimeForSave(startTime);
  const normalizedEnd = sanitizeTimeForSave(endTime);
  const normalizedBreak = sanitizeTimeForSave(breakTime);

  if (
    !normalizedStart ||
    !normalizedEnd ||
    !normalizedBreak ||
    !isValidTime(normalizedStart) ||
    !isValidTime(normalizedEnd) ||
    !isValidTime(normalizedBreak)
  ) {
    return "0:00";
  }

  const startMinutes = timeTextToMinutes(normalizedStart);
  const endMinutes = timeTextToMinutes(normalizedEnd);
  const breakMinutes = timeTextToMinutes(normalizedBreak);

  const diff = endMinutes - startMinutes - breakMinutes;
  return diff > 0 ? minutesToTimeText(diff) : "0:00";
}

function parseLocalDate(dateText) {
  if (!dateText) return null;

  const split = dateText.split("-");
  if (split.length !== 3) return null;

  const [y, m, d] = split.map(Number);
  const date = new Date(y, m - 1, d);

  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isWeekendDate(dateText) {
  const date = parseLocalDate(dateText);
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDate(dateText) {
  const date = parseLocalDate(dateText);
  if (!date) return dateText || "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const week = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];

  return `${month}/${day}（${week}）`;
}

export default AttendancePage;