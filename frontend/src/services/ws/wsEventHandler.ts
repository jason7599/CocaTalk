import type { IMessage } from "@stomp/stompjs";
import type { MessageDto } from "../../shared/types";
import { useChatroomsStore } from "../../features/chat/chatroomsStore";
import { useActiveChatroomStore } from "../../features/chat/active/activeChatroomStore";

export function wsHandleMessage(frame: IMessage) {
    const msg = JSON.parse(frame.body) as MessageDto;

    useChatroomsStore.getState().onNewMessage(msg);

    const activeChatroom = useActiveChatroomStore.getState();
    if (activeChatroom.activeRoomId === msg.roomId) {
        activeChatroom.onNewMessage(msg);
    }
}

export function wsHandleEvent(frame: IMessage) {
    console.log("evt", frame.body);
};