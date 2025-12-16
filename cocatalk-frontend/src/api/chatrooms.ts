import type { ChatroomSummary, DirectChatroomRequest } from "../types";
import api from "./api";

export async function loadChatrooms(): Promise<ChatroomSummary[]> {
    return (await api.get('/chatrooms')).data;
};

export async function getOrCreateDirectChatroom(request: DirectChatroomRequest): Promise<ChatroomSummary> {
    return (await api.post('/chatrooms/direct', request)).data;
} 