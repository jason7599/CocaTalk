import { create } from "zustand";
import type { FriendRequestSentResult, ReceivedFriendRequest, SentFriendRequest } from "../types";
import {
    sendFriendRequest as apiSendFriendRequest,
    acceptFriendRequest,
    listReceivedRequests,
    declineFriendRequest,
    listSentRequests,
    cancelFriendRequest,
} from "../api/friendship";
import { useFriendsStore } from "./friendsStore";

export type FriendRequestSubmitState = {
    submitting: boolean;
    error: string | null;
    success: FriendRequestSentResult | null;
};

type FriendRequestsState = {
    // tables
    receivedRequests: ReceivedFriendRequest[];
    sentRequests: SentFriendRequest[];

    loading: boolean;
    loadError: string | null;

    submitState: FriendRequestSubmitState;

    // reducers
    setReceived: (reqs: ReceivedFriendRequest[]) => void;
    setSent: (reqs: SentFriendRequest[]) => void;

    upsertReceived: (req: ReceivedFriendRequest) => void;
    upsertSent: (req: SentFriendRequest) => void;

    removeReceivedLocal: (senderId: number) => void;
    removeSentLocal: (receiverId: number) => void;

    setSubmitState: (state: Partial<FriendRequestSubmitState>) => void;
    resetSubmitState: () => void;

    // commands
    fetchReceived: () => Promise<void>;
    fetchSent: () => Promise<void>;
    // merged command
    fetchAll: () => Promise<void>;

    sendFriendRequest: (username: string) => Promise<FriendRequestSentResult | null>;

    acceptRequest: (senderId: number) => Promise<void>;
    declineRequest: (senderId: number) => Promise<void>;
    cancelRequest: (receiverId: number) => Promise<void>;
};

export const useFriendRequestsStore = create<FriendRequestsState>((set, get) => ({
    receivedRequests: [],
    sentRequests: [],

    loading: false,
    loadError: null,

    submitState: { submitting: false, error: null, success: null },

    // reducers
    setReceived: (reqs) => set({ receivedRequests: reqs }),
    setSent: (reqs) => set({ sentRequests: reqs }),

    upsertReceived: (req) => {
        set((s) => ({ receivedRequests: [req, ...s.receivedRequests] }));
    },

    upsertSent: (req) => {
        set((s) => ({ sentRequests: [req, ...s.sentRequests] }));
    },

    removeReceivedLocal: (senderId) =>
        set((s) => ({
            receivedRequests: s.receivedRequests.filter((r) => r.senderId !== senderId),
        })),

    removeSentLocal: (receiverId) =>
        set((s) => ({
            sentRequests: s.sentRequests.filter((r) => r.receiverId !== receiverId),
        })),

    setSubmitState: (state) => {
        set((s) => ({
            submitState: {
                ...s.submitState,
                ...state
            }
        }));
    },

    resetSubmitState: () => {
        set({ submitState: { submitting: false, error: null, success: null } });
    },

    // commands
    fetchReceived: async () => {
        try {
            const data = await listReceivedRequests();
            get().setReceived(data);
        } catch (err: any) {
            set({ loadError: err });
        }
    },

    fetchSent: async () => {
        try {
            const data = await listSentRequests();
            get().setSent(data);
        } catch (err: any) {
            set({ loadError: err });
        }
    },

    // merged command (orchestrator)
    fetchAll: async () => {
        const { fetchReceived, fetchSent } = get();
        await Promise.all([fetchReceived(), fetchSent()]);
    },

    sendFriendRequest: async (username) => {
        const trimmed = username.trim();
        if (!trimmed) {
            get().setSubmitState({ submitting: false, error: "Empty username input", success: null });
            return null;
        }

        get().setSubmitState({ submitting: true, error: null, success: null });

        try {
            const result = await apiSendFriendRequest(trimmed);
            get().setSubmitState({ success: result });

            if (result.type === "AUTO_ACCEPT") {
                // Make cross-store side effect very explicit:
                useFriendsStore.getState().upsert(result.friendInfo);
                get().removeReceivedLocal(result.friendInfo.id);
            } else {
                get().upsertSent(result.request);
            }

            return result;
        } catch (err: any) {
            get().setSubmitState({ error: err.message });
            return null;
        } finally {
            get().setSubmitState({ submitting: false });
        }
    },

    acceptRequest: async (senderId) => {
        const friend = await acceptFriendRequest(senderId);
        get().removeReceivedLocal(senderId);

        // cross-store side effect
        useFriendsStore.getState().upsert(friend);
    },

    declineRequest: async (senderId) => {
        await declineFriendRequest(senderId);
        get().removeReceivedLocal(senderId);
    },

    cancelRequest: async (receiverId) => {
        await cancelFriendRequest(receiverId);
        get().removeSentLocal(receiverId);
    },
}));
