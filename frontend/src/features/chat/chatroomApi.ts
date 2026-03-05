import api from "../../services/api";

export async function resolveDirectChatroom(targetUserId: number): Promise<number> {
    return (await api.post("/chats/direct", { targetUserId })).data;
};

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