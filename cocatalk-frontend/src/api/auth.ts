import api from "./api";

export async function login(username: string, password: string) {
    try {
        const response = await api.post('/auth/login', {
            username,
            password
        });

        const { token } = response.data
        localStorage.setItem('token', token)

        return token;
    } catch (err: any) {
        switch (err.response.status) {
            case 401:
            case 403:
                throw new Error("Invalid credentials.");
            default:
                throw err;
        }
    }
}

export async function register(username: string, password: string) {
    try {
        await api.post('/auth/register', {
            username,
            password
        });
    } catch (err: any) {
        switch (err.response.status) {
            case 400:
                throw new Error("Invalid args!");
            case 409:
                throw new Error("Username already taken!");
            default:
                throw err;
        }
    }
}