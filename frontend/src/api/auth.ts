import api from "./api";

export async function login(email: string, password: string): Promise<string> {
    const response = await api.post('/auth/login', {
        email,
        password
    });

    const token = response.data
    localStorage.setItem('token', token)

    return token;
}

export async function register(email: string, username: string, password: string): Promise<void> {
    await api.post('/auth/register', {
        email,
        username,
        password
    });
}

export function isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
}