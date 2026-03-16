import api from "../../services/apiClient";
import type { UserInfo } from "../../shared/types";

export async function apiSearchUsers(query: string): Promise<UserInfo[]> {
    return (await api.get(`/users/search?query=${encodeURIComponent(query)}`)).data;
}

export async function apiAddContact(targetId: number): Promise<UserInfo> {
    return (await api.post(`/users/contacts/${targetId}`)).data;
};

export async function apiRemoveContact(targetId: number): Promise<void> {
    await api.delete(`/users/contacts/${targetId}`);
}