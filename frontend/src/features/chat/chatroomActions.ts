import { useActiveChatroomStore } from "./active/activeChatroomStore";
import { apiCreateGroupChatroom, apiResolveDirectChatroom } from "./chatroomApi";
import { useChatroomsStore } from "./chatroomsStore";

export async function openDirectChatroom(targetUserId: number): Promise<void> {
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
        active.setActiveChatroom(await apiResolveDirectChatroom(targetUserId));
    }
};

export async function createGroupChatroom(initMembers: number[]): Promise<void> {
    const roomId = await apiCreateGroupChatroom(initMembers);
    useActiveChatroomStore.getState().setActiveChatroom(roomId);
}