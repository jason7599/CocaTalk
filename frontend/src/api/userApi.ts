import type { UserInfo } from "../types";
import api from "./api";

export async function getAuthenticatedUser(): Promise<UserInfo> {
    return (await api.get('/me')).data;
}