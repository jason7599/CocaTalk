import { create } from "zustand";
import type { ChatroomSummary } from "../../types"
import { createRoom, loadChatrooms } from "../chatrooms";

type ChatroomsState = {
    chatrooms: ChatroomSummary[];
    loading: boolean;
    error: string | null;

    selectedChatroomId: number | null;

    selectChatroom: (roomId: number | null) => void;
    addChatroom: (roomName: string | null) => Promise<void>;
    updateChatroom: (roomId: number, updates: Partial<ChatroomSummary>) => void;
    removeChatroom: (roomId: number) => void;
    fetch: () => Promise<void>;
}

export const useChatroomsStore = create<ChatroomsState>((set, get) => ({
    chatrooms: [],
    loading: false,
    error: null,
    selectedChatroomId: null,

    selectChatroom: (roomId: number | null) => {
        set({ selectedChatroomId: roomId });
    },

    addChatroom: async (roomName: string | null) => {
        set({ loading: true, error: null });
        try {
            const newRoom = await createRoom(roomName);
            
            set((s) => ({
                chatrooms: [newRoom, ...s.chatrooms],
                loading: false,
                selectedChatroomId: newRoom.id
            }));
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    updateChatroom: (roomId: number, updates: Partial<ChatroomSummary>) => {
        const updated =
            get().chatrooms
                .map((r) => (r.id === roomId ? { ...r, ...updates } : r))
                .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());

        set({ chatrooms: updated });
    },

    removeChatroom: (roomId: number) => {
        const updated = get().chatrooms.filter((r) => r.id !== roomId);
        set({ chatrooms: updated });
    },

    fetch: async () => {
        set({ loading: true, error: null });
        try {
            const data = await loadChatrooms();

            const sorted = [...data].sort(
                (a, b) =>
                    new Date(b.lastMessageAt || 0).getTime() -
                    new Date(a.lastMessageAt || 0).getTime()
            );

            set({ chatrooms: sorted, loading: false });
        } catch (err: any) {
            console.error(err);
            set({ error: err.message ?? "Failed to load chatrooms", loading: false });
        }
    },
}));