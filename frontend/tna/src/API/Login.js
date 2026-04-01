const BASE_URL = "http://localhost:8080";

export const loginApi = async (email, password) => {
    return fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        body:  JSON.stringify({ email, password }),
    })
};

export const registerApi = async (userName, email, password) => {
    return fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify( {name: userName, email, password} ),
    })
};