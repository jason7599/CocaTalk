import { create } from "zustand";
import type { PendingRequest } from "../../types";
import { acceptFriendRequest, listPendingRequests, removeFriendRequest } from "../friendship";


type PendingRequestsState = {
    requests: PendingRequest[];
    loading: boolean;
    error: string | null;

    fetch: () => Promise<void>;
    accept: (senderId: number) => Promise<void>;
    decline: (senderId: number) => Promise<void>;
};

export const usePendingRequestsStore = create<PendingRequestsState>((set, get) => ({
    requests: [],
    loading: false,
    error: null,
    pendingCount: 0,

    fetch: async () => {
        try {
            set({ loading: true, error: null});
            const data = await listPendingRequests();
            set({requests: data});
        } catch (err: any) {
            console.error(err);
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    accept: async (senderId: number) => {
        await acceptFriendRequest(senderId);
        const updated = get().requests.filter((r) => r.senderId !== senderId);
        set({ requests: updated });
    },

    decline: async (senderId: number) => {
        await removeFriendRequest(senderId);
        const updated = get().requests.filter((r) => r.senderId !== senderId);
        set({ requests: updated });
    },
}));