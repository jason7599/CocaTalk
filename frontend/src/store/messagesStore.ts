import { create } from "zustand";
import type { MessageResponse } from "../types";
import { loadMessages } from "../api/chatrooms";

export type MessagesState = {
    roomId: number | null;

    messages: MessageResponse[];
    nextCursor: number | null;
    hasMore: boolean;

    loadingInitial: boolean;
    loadingOlder: boolean;
    error: string | null;

    clear: () => void;
    loadInitial: (roomId: number, limit?: number) => Promise<void>;
    loadOlder: (limit?: number) => Promise<void>;
    upsert: (roomId: number, msg: MessageResponse) => void;
};

export const useMessagesStore = create<MessagesState>((set, get) => ({
    roomId: null,
    messages: [],
    nextCursor: null,
    hasMore: false,
    loadingInitial: false,
    loadingOlder: false,
    error: null,

    clear: () => set({
        roomId: null,
        messages: [],
        nextCursor: null,
        hasMore: false,
        loadingInitial: false,
        loadingOlder: false,
        error: null
    }),

    loadInitial: async (roomId: number, limit?: number) => {
        get().clear();
        set({ roomId: roomId, loadingInitial: true });

        try {
            const page = await loadMessages(roomId, { limit });

            // user switched rooms while request in flight 
            if (get().roomId !== roomId) {
                return;
            }

            set({
                messages: page.messages,
                nextCursor: page.nextCursor,
                hasMore: page.hasMore,
                error: null
            });
        } catch (err: any) {
            if (get().roomId !== roomId) {
                return;
            }
            set({ error: err.message });
        } finally {
            set({ loadingInitial: false });
        }
    },

    loadOlder: async (limit?: number) => {
        const { roomId, nextCursor, hasMore, loadingOlder } = get();

        if (roomId == null) return;
        if (!hasMore || loadingOlder) return;
        if (nextCursor == null) return;

        set({ loadingOlder: true, error: null });

        try {
            const page = await loadMessages(roomId, { cursor: nextCursor, limit });

            if (get().roomId !== roomId) {
                return;
            }

            set((s) => ({
                messages: [...page.messages, ...s.messages],
                nextCursor: page.nextCursor,
                hasMore: page.hasMore,
            }));
        } catch (err: any) {
            if (get().roomId !== roomId) {
                return;
            }
            set({ error: err.message });
        } finally {
            set({ loadingOlder: false });
        }
    },

    upsert: (roomId: number, msg: MessageResponse) => {
        if (get().roomId !== roomId) {
            return;
        }

        set((s) => ({
            messages: [...s.messages, msg]
        }));
    }
}));

