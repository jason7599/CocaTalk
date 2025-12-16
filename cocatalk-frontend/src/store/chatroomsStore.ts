import { create } from "zustand";
import type { ChatroomSummary } from "../types"
import { getOrCreateDirectChatroom, loadChatrooms } from "../api/chatrooms";

type ChatroomsState = {
    chatrooms: ChatroomSummary[];
    loading: boolean;
    error: string | null;

    selectedChatroomId: number | null;

    selectChatroom: (roomId: number | null) => void;
    addChatroom: (roomName: string | null) => Promise<void>;
    upsertChatroom: (room: ChatroomSummary) => void;
    openDirectChatroom: (otherUserId: number) => Promise<void>;
    updateChatroom: (roomId: number, updates: Partial<ChatroomSummary>) => void;
    removeChatroom: (roomId: number) => void;
    fetch: () => Promise<void>;
}

export const useChatroomsStore = create<ChatroomsState>((set, get) => ({
    chatrooms: [],
    loading: false,
    error: null,
    selectedChatroomId: null,

    selectChatroom: (roomId: number | null): void => {
        set({ selectedChatroomId: roomId });
    },

    addChatroom: async (roomName: string | null): Promise<void> => {
        // set({ loading: true, error: null });
        // try {
        //     const newRoom = await createRoom(roomName);

        //     set((s) => ({
        //         chatrooms: [newRoom, ...s.chatrooms],
        //         loading: false,
        //         selectedChatroomId: newRoom.id
        //     }));
        // } catch (err: any) {
        //     set({ error: err.message, loading: false });
        // }
    },

    upsertChatroom: (room: ChatroomSummary): void => {
        set((s) => {
            if (s.chatrooms.some((r) => r.id === room.id)) return s;

            return {
                chatrooms: [room, ...s.chatrooms].sort(
                    (a, b) =>
                        new Date(b.lastMessageAt || 0).getTime() -
                        new Date(a.lastMessageAt || 0).getTime()
                )
            };
        })
    },

    openDirectChatroom: async (otherUserId: number): Promise<void> => {
        set({ loading: true, error: null });
        try {
            const room = await getOrCreateDirectChatroom({ otherUserId });
            get().upsertChatroom(room);
            get().selectChatroom(room.id);
        } catch (err: any) {
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    updateChatroom: (roomId: number, updates: Partial<ChatroomSummary>): void => {
        const updated =
            get().chatrooms
                .map((r) => (r.id === roomId ? { ...r, ...updates } : r))
                .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());

        set({ chatrooms: updated });
    },

    removeChatroom: (roomId: number): void => {
        const updated = get().chatrooms.filter((r) => r.id !== roomId);
        set({ chatrooms: updated });
    },

    fetch: async (): Promise<void> => {
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