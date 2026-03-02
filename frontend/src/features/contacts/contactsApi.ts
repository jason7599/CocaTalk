import api from "../../services/api";
import type { UserInfo } from "../../shared/types";

export async function searchUsers(query: string): Promise<UserInfo[]> {
    return (await api.get(`/users/search?query=${encodeURIComponent(query)}`)).data;
}

export async function addContact(targetId: number): Promise<UserInfo> {
    return (await api.post(`/users/contacts/${targetId}`)).data;
};

export async function removeContact(targetId: number): Promise<void> {
    await api.delete(`/users/contacts/${targetId}`);
}