import api from "../../../services/apiClient";
import type { MessageDto, MessagePage } from "../../../shared/types";

type LoadOlderMessagesParams = {
    cursor: number;
    signal?: AbortSignal;
};

export async function apiLoadOlderMessages(
    roomId: number,
    { cursor, signal }: LoadOlderMessagesParams
): Promise<MessagePage> {
    const qs = new URLSearchParams({
        cursor: String(cursor)
    });

    return (
        await api.get(`/chats/${roomId}/messages?${qs.toString()}`, { signal })
    ).data;
}

export async function apiSendMessage(roomId: number, content: string, clientId: string): Promise<MessageDto> {
    return (await api.post(`/chats/${roomId}/messages`, { content, clientId })).data;
};