import { useActiveChatroomStore } from "./activeChatroomStore";
import { resolveDirectChatroom } from "./chatroomApi";
import { useChatroomsStore } from "./chatroomsStore";

export async function openDirectChatroom(targetUserId: number) {
    const chatrooms = useChatroomsStore.getState();
    const active = useActiveChatroomStore.getState();

    // first, search locally
    const existing = chatrooms.chatrooms.find(
        r =>
            r.roomType === "DIRECT"
        && r.membersPreview.some(m => m.userId === targetUserId)
    );

    if (existing) {
        active.setActiveChatroom(existing.roomId);
    } else {
        active.setActiveChatroom(await resolveDirectChatroom(targetUserId));
    }
};