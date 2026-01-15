import type { UserInfo } from "../types";
import api from "./api";

export async function addContact(username: string): Promise<UserInfo> {
    return (await api.post('/contacts', { username })).data;
}

export async function listContacts(): Promise<UserInfo[]> {
    return (await api.get('/contacts')).data;
}

export async function removeContact(contactId: number): Promise<void> {
    await api.delete(`/contacts/${contactId}`);
}