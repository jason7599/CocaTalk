import api from "../../services/apiClient";
import type { UserInfo } from "../../shared/types";

export async function apiAddBlock(targetId: number): Promise<UserInfo> {
    return (await api.post(`/users/block/${targetId}`)).data;
}

export async function apiRemoveBlock(targetId: number): Promise<void> {
    await api.delete(`/users/block/${targetId}`);
}