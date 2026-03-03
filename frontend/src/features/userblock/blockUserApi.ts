import api from "../../services/api";
import type { UserInfo } from "../../shared/types";

export async function addBlock(targetId: number): Promise<UserInfo> {
    return (await api.post(`/users/block/${targetId}`)).data;
}

export async function removeBlock(targetId: number): Promise<void> {
    await api.delete(`/users/block/${targetId}`);
}