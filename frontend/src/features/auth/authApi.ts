import api from "../../services/apiClient";
import type { UserInfo, UserLoginResponse } from "../../shared/types";

// returns user id
export async function apiRegister(username: string, password: string): Promise<number> {
    return (await api.post("/auth/register", { username, password })).data
};

export async function apiLogin(username: string, password: string): Promise<UserLoginResponse> {
    return (await api.post("/auth/login", { username, password })).data;
};

export async function apiGetCurrentUser(): Promise<UserInfo> {
    return (await api.get("/users/me")).data;
};

