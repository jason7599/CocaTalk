import api from "../../../services/api";
import type { MessagePage } from "../../../shared/types";

type LoadMessagesParams = {
    before?: number;
    after?: number;
    signal?: AbortSignal;
};

export async function loadMessages(
    roomId: number,
    params: LoadMessagesParams
): Promise<MessagePage> {

    const { before, after, signal } = params;

    if ((before == null) === (after == null)) {
        throw new Error("Exactly one of 'before' or 'after' must be provided");
    }

    const qs = new URLSearchParams();

    if (before != null) qs.set("before", String(before));
    if (after != null) qs.set("after", String(after));

    return (await api.get(
        `/chats/${roomId}/messages?${qs.toString()}`,
        { signal }
    )).data
}