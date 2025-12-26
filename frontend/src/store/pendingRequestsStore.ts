import { create } from "zustand";
import type { PendingRequest } from "../types";
import {
    acceptFriendRequest,
    listPendingRequests,
    removeFriendRequest,
} from "../api/friendship";
import { useFriendsStore } from "./friendsStore";

type PendingRequestsState = {
    requests: PendingRequest[];
    loading: boolean;
    error: string | null;

    // reducers
    setAll: (reqs: PendingRequest[]) => void;
    removeLocal: (senderId: number) => void;

    // commands
    fetch: () => Promise<void>;
    accept: (senderId: number) => Promise<void>;
    decline: (senderId: number) => Promise<void>;
};

export const usePendingRequestsStore = create<PendingRequestsState>((set, get) => ({
    requests: [],
    loading: false,
    error: null,

    // reducers
    setAll: (reqs) => set({ requests: reqs }),

    removeLocal: (senderId) =>
        set((s) => {
            const updated = s.requests.filter((r) => r.senderId !== senderId);
            return { requests: updated };
        }),

    // commands
    fetch: async () => {
        set({ loading: true, error: null });
        try {
            const data = await listPendingRequests();
            get().setAll(data);
        } catch (err: any) {
            console.error(err);
            set({ error: err?.message ?? "Failed to load pending requests" });
        } finally {
            set({ loading: false });
        }
    },

    accept: async (senderId) => {
        set({ loading: true, error: null });
        try {
            const friend = await acceptFriendRequest(senderId);
            get().removeLocal(senderId);

            // explicit cross-store side effect:
            useFriendsStore.getState().upsert(friend);
        } catch (err: any) {
            set({ error: err?.message ?? "Failed to accept request" });
        } finally {
            set({ loading: false });
        }
    },

    decline: async (senderId) => {
        set({ loading: true, error: null });
        try {
            await removeFriendRequest(senderId);
            get().removeLocal(senderId);
        } catch (err: any) {
            set({ error: err?.message ?? "Failed to decline request" });
        } finally {
            set({ loading: false });
        }
    },
}));
