import api from "../../services/apiClient";
import type { ChatroomBootstrapDto, ChatroomSummary, CreateGroupResponse } from "../../shared/types";

export async function apiResolveDirectChatroom(targetUserId: number): Promise<number> {
    return (await api.post("/chats/direct", { targetUserId })).data;
};

export async function apiChatroomBootstrap(roomId: number): Promise<ChatroomBootstrapDto> {
    return (await api.get(`/chats/${roomId}/bootstrap`)).data;
};

export async function apiGetChatroomSummary(roomId: number): Promise<ChatroomSummary> {
    return (await api.get(`/chats/${roomId}`)).data;
};

export async function apiUpdateLastAck(roomId: number, seq: number): Promise<void> {
    await api.put(`/chats/${roomId}/ack`, { seq });
};

export async function apiCreateGroupChatroom(initMembers: number[]): Promise<CreateGroupResponse> {
    return (await api.post("/chats/group", { initMembers })).data;
};