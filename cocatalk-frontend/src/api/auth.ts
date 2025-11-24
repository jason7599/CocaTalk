import api from "./api";

export async function login(username: string, password: string) {
    const response = await api.post('/auth/login', {
        username,
        password
    });

    const token = response.data
    localStorage.setItem('token', token)

    return token;
}

export async function register(username: string, password: string) {
    await api.post('/auth/register', {
        username,
        password
    });
}

export async function getCurrentUser() {
    const response = await api.get("/users/me");
    return response.data;
}

export function isLoggedIn() {
    const token = localStorage.getItem('token');
    return !!token;
}