import { useActiveChatroomStore } from "./active/activeChatroomStore";
import { apiResolveDirectChatroom } from "./chatroomApi";
import { useChatroomsStore } from "./chatroomsStore";

export async function openDirectChatroom(targetUserId: number) {
    const chatrooms = useChatroomsStore.getState();
    const active = useActiveChatroomStore.getState();

    // TODO: shit. So this was why I shipped the whole UserInfo when fetching member previews
    
    // first, search locally
    const existing = chatrooms.chatrooms.find(
        r =>
            r.roomType === "DIRECT"
        && r.memberNamesPreview.some(m => m.userId === targetUserId)
    );

    if (existing) {
        active.setActiveChatroom(existing.roomId);
    } else {
        active.setActiveChatroom(await apiResolveDirectChatroom(targetUserId));
    }
};