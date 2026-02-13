import type { UserNotification } from "../types";
import { useChatroomsStore } from "../store/chatroomsStore";
import { useActiveRoomStore } from "../store/activeRoomStore";

export function handleUserNotification(notification: UserNotification) {
    switch (notification.type) {
        case "DIRECT_CHAT_CREATED":
            useActiveRoomStore.getState().onDirectChatCreated(notification.payload);
            break;

        case "MESSAGE_PREVIEW":
            useChatroomsStore.getState().onNewMessagePreview(notification.payload);
            break;
    }
}
