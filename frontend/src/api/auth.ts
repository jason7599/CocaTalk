import type { UserInfo } from "../types";
import api from "./api";

export async function login(username: string, password: string): Promise<string> {
    const response = await api.post('/auth/login', {
        username,
        password
    });

    const token = response.data
    localStorage.setItem('token', token)

    return token;
}

export async function register(username: string, password: string): Promise<void> {
    await api.post('/auth/register', {
        username,
        password
    });
}

export async function getCurrentUser(): Promise<UserInfo> {
    return (await api.get('/users/me')).data;
}

export function isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
}