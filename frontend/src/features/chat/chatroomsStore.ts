import { create } from "zustand";
import type { ChatroomSummary } from "../../shared/types";

type ChatroomsState = {
    chatrooms: ChatroomSummary[];

    hydrate: (rooms: ChatroomSummary[]) => void;
    reset: () => void;
};


export const useChatroomsStore = create<ChatroomsState>((set, get) => ({
    chatrooms: [],

    hydrate: (rooms) => {
        set({
            chatrooms: rooms
        });
    },

    reset: () => {
        set({})
    }
}));
