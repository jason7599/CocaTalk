import { useActiveChatroomStore } from "./activeChatroomStore";
import { useChatroomsStore } from "./chatroomsStore";

export async function getOrCreateDirectChat(targetUserId: number) {
    const chatrooms = useChatroomsStore.getState();
    const active = useActiveChatroomStore.getState();

    // 1. search locally
    const existing = chatrooms.chatrooms.find(
        r =>
            r.type === "DIRECT"
        && r.membersPreview.some(m => m.userId === targetUserId)
    );

    if (existing) {
        active.setActiveChatroom(existing.roomId);
    }
};