import type { UserInfo } from "../types";
import api from "./api";

export async function getCurrentUser(): Promise<UserInfo> {
    return (await api.get('/users/me')).data;
}

export async function searchUsers(query: string): Promise<UserInfo[]> {
    return (await api.get(`/users/search?q=${query}`)).data;
}