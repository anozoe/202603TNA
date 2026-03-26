export async function getUserList(yearMonth, page = 0, size = 10) {
  const response = await fetch(
    `http://localhost:8080/api/users/${yearMonth}?page=${page}&size=${size}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "サーバーに接続できません");
  }

  return data;
}