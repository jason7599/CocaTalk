import api from "./api";

export async function login(email: string, password: string): Promise<string> {
    const response = await api.post('/auth/login', {
        email,
        password
    });

    return response.data;
}

export async function register(email: string, username: string, password: string): Promise<void> {
    await api.post('/auth/register', {
        email,
        username,
        password
    });
}