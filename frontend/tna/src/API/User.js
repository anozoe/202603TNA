
const BASE_URL = "http://localhost:8080";

export const getUserList = async (yearMonth) => {
    const url = `${BASE_URL}/api/users/${yearMonth}`;
    return fetch (url)
        .then(response => response.json())
        .then(data => {
            return data
        })
};