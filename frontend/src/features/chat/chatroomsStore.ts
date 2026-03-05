import { create } from "zustand";
import type { ChatroomSummary } from "../../shared/types";

type ChatroomsState = {
    chatrooms: ChatroomSummary[];
    byId: Record<number, ChatroomSummary>;

    hydrate: (rooms: ChatroomSummary[]) => void;
    upsert: (room: ChatroomSummary) => void;
    removeLocal: (roomId: number) => void;
    reset: () => void;

    // todo: updateLastMessage

    setMyLastAck: (roomId: number, seq: number) => void;
};


export const useChatroomsStore = create<ChatroomsState>((set, get) => ({
    chatrooms: [],
    byId: {},

    hydrate: (rooms) => {
        set({
            chatrooms: rooms,
            byId: Object.fromEntries(rooms.map((r) => [r.roomId, r]))
        });
    },

    upsert: (room) => {
        const s = get();
        const exists = s.byId[room.roomId];

        const newById = {
            ...s.byId,
            [room.roomId]: room
        };

        let newChatrooms;

        if (exists) {
            newChatrooms = s.chatrooms.map((r) =>
                r.roomId === room.roomId ? room : r
            );
        } else {
            // new chatroom goes up top
            newChatrooms = [room, ...s.chatrooms];
        }

        set({
            byId: newById,
            chatrooms: newChatrooms
        });
    },

    removeLocal: (roomId) => {
        const s = get();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [roomId]: _, ...rest } = s.byId;

        set({
            byId: rest,
            chatrooms: s.chatrooms.filter((r) => r.roomId !== roomId)
        });
    },

    reset: () => {
        set({
            chatrooms: [],
            byId: {}
        });
    },

    setMyLastAck: (roomId, seq) => {
        const s = get();
        const room = s.byId[roomId];
        if (!room) return;

        if (seq <= room.myLastAck) return;

        const updated: ChatroomSummary = {
            ...room,
            myLastAck: seq
        };

        set({
            byId: {
                ...s.byId,
                [roomId]: updated
            },
            chatrooms: s.chatrooms.map((r) =>
                r.roomId === roomId ? updated : r
            )
        });
    }
}));
