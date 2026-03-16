import api from "../../services/apiClient";
import type { ChatroomBootstrapDto } from "../../shared/types";

export async function apiResolveDirectChatroom(targetUserId: number): Promise<number> {
    return (await api.post("/chats/direct", { targetUserId })).data;
};

export async function apiChatroomBootstrap(roomId: number): Promise<ChatroomBootstrapDto> {
    return (await api.get(`/chats/${roomId}/bootstrap`)).data;
}

// omit cursor for inital load - loading latest messages
// limit is defaulted to 30 in the backend.
// export async function loadMessages(
//     roomId: number,
//     options?: {
//         cursor?: number;
//         limit?: number;
//         signal?: AbortSignal
//     }
// ): Promise<MessagePage> {
//     const params = new URLSearchParams();

//     if (options?.cursor != null) {
//         params.set("cursor", String(options.cursor));
//     }

//     if (options?.limit != null) {
//         params.set("limit", String(options.limit));
//     }

//     const query = params.toString();
//     const url = `/chatrooms/${roomId}/messages${query ? `?${query}` : ""}`;

//     return (await api.get(url, { signal: options?.signal })).data;
// }