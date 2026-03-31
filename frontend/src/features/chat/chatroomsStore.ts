import { create } from "zustand";
import type { ChatroomSummary, MessageDto } from "../../shared/types";
import { apiGetChatroomSummary } from "./chatroomApi";

type ChatroomsState = {
    chatrooms: ChatroomSummary[];
    byId: Record<number, ChatroomSummary>;

    _fetchingRooms: Set<number>;

    hydrate: (rooms: ChatroomSummary[]) => void;
    upsert: (room: ChatroomSummary) => void;
    removeLocal: (roomId: number) => void;
    reset: () => void;

    onNewMessage: (msg: MessageDto) => Promise<void>;

    setMyLastAck: (roomId: number, seq: number) => void;
};

export const useChatroomsStore = create<ChatroomsState>((set, get) => ({
    chatrooms: [],
    byId: {},

    _fetchingRooms: new Set(),

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

    onNewMessage: async (msg) => {
        let room = get().byId[msg.roomId];

        // This absolutely can happen in case of ws reconnects.
        // Or just simply receiving a direct message from someone for the first time.
        // Or group chat creation.
        if (!room) {
            if (!get()._fetchingRooms.has(msg.roomId)) {
                get()._fetchingRooms.add(msg.roomId);
                try {
                    const fetched = await apiGetChatroomSummary(msg.roomId);
                    get().upsert(fetched);
                } finally {
                    get()._fetchingRooms.delete(msg.roomId);
                }
            }
        }

        // re-read state after await
        const s = get();
        room = s.byId[msg.roomId];
        if (!room) return;

        if (room.lastMessage.seq >= msg.seq) return;

        const updated: ChatroomSummary = {
            ...room,
            lastMessage: msg
        };

        set({
            byId: {
                ...s.byId,
                [msg.roomId]: updated
            },
            chatrooms: [
                updated,
                ...s.chatrooms.filter((r) => r.roomId !== msg.roomId)
            ]
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
