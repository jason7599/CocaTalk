import type { UserInfo } from "../types";
import api from "./api";

export async function getCurrentUser(): Promise<UserInfo> {
    return (await api.get('/me')).data;
}