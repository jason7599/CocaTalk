import type { ChatroomSummary } from "../types";
import api from "./api";

export async function loadChatrooms(): Promise<ChatroomSummary[]> {
    const res = await api.get('/chatrooms');
    return res.data;
};

export async function createRoom(name: string): Promise<ChatroomSummary> {
    const res = await api.post('/chatrooms/create', { name });
    return res.data;
}