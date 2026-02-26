import type { ChatroomSummary, DirectChatroomRequest, MessagePage, RoomMemberInfo } from "../types";
import api from "./api";

export async function loadChatrooms(): Promise<ChatroomSummary[]> {
    return (await api.get('/chatrooms')).data;
};

export async function getOrCreateDirectChatroom(request: DirectChatroomRequest): Promise<ChatroomSummary> {
    return (await api.post('/chatrooms/direct', request)).data;
}

// omit cursor for inital load - loading latest messages
// limit is defaulted to 30 in the backend.
export async function loadMessages(
    roomId: number,
    options?: {
        cursor?: number;
        limit?: number;
        signal?: AbortSignal
    }
): Promise<MessagePage> {
    const params = new URLSearchParams();

    if (options?.cursor != null) {
        params.set("cursor", String(options.cursor));
    }

    if (options?.limit != null) {
        params.set("limit", String(options.limit));
    }

    const query = params.toString();
    const url = `/chatrooms/${roomId}/messages${query ? `?${query}` : ""}`;

    return (await api.get(url, { signal: options?.signal })).data;
}

export async function getMembersInfo(roomId: number, options?: { signal?: AbortSignal }): Promise<RoomMemberInfo[]> {
    return (await api.get(`/chatrooms/${roomId}/members`, { signal: options?.signal })).data;
}

export async function createGroupChat(memberIds: number[]): Promise<ChatroomSummary> {
    return (await api.post('/chatrooms/groupchat', { memberIds })).data;
}