import { create } from "zustand";
import type { FriendRequestSuccessDto, UserInfo } from "../types";
import { listFriends, removeFriend as apiRemoveFriend, sendFriendRequest as apiSendFriendRequest } from "../api/friendship";
import { usePendingRequestsStore } from "./pendingRequestsStore";

export type FriendRequestState = {
    submitting: boolean;
    error: string | null;
    success: FriendRequestSuccessDto | null;
};

type FriendsState = {
    friends: UserInfo[];

    loading: boolean;
    loadError: string | null;

    friendRequestState: FriendRequestState;
    
    // reducers
    setAll: (friends: UserInfo[]) => void;
    upsert: (friend: UserInfo) => void;
    removeLocal: (friendId: number) => void;

    setFriendRequestState: (patch: Partial<FriendRequestState>) => void;
    resetFriendRequestState: () => void;

    // commands
    fetch: () => Promise<void>;
    sendFriendRequest: (username: string) => Promise<FriendRequestSuccessDto | null>;
    removeFriend: (friendId: number) => Promise<void>;
};

export const useFriendsStore = create<FriendsState>((set, get) => ({
    friends: [],
    loading: false,
    loadError: null,

    friendRequestState: { submitting: false, error: null, success: null },

    // reducers
    setAll: (friends) => set({ friends }),

    upsert: (friend) =>
        set((s) => (s.friends.some((f) => f.id === friend.id) ? s : { friends: [...s.friends, friend] })),

    removeLocal: (friendId) =>
        set((s) => ({ friends: s.friends.filter((f) => f.id !== friendId) })),

    setFriendRequestState: (patch) =>
        set((s) => ({ friendRequestState: { ...s.friendRequestState, ...patch } })),
    
    resetFriendRequestState: () =>
        set({ friendRequestState: { submitting: false, error: null, success: null } }),

    // commands
    fetch: async () => {
        set({ loading: true, loadError: null });
        try {
            const data = await listFriends();
            get().setAll(data);
        } catch (err: any) {
            set({ loadError: err?.message ?? "Failed to load friends" });
        } finally {
            set({ loading: false });
        }
    },

    sendFriendRequest: async (username: string) => {
        const trimmed = username.trim();
        if (!trimmed) {
            get().setFriendRequestState({ error: "Enter a username!" });
            return null;
        }

        get().setFriendRequestState({ submitting: true, error: null, success: null });

        try {
            const result = await apiSendFriendRequest(trimmed);
            get().setFriendRequestState({ success: result });

            if (result.type === "AUTO_ACCEPT") {
                get().upsert(result.friendInfo);

                // Make cross-store side effect very explicit:
                usePendingRequestsStore.getState().removeLocal(result.friendInfo.id);
            }

            return result;
        } catch (err: any) {
            get().setFriendRequestState({ error: err?.message ?? "Failed to send friend request" });
            return null;
        } finally {
            get().setFriendRequestState({ submitting: false });
        }
    },

    removeFriend: async (friendId: number) => {
        try {
            await apiRemoveFriend(friendId);
            get().removeLocal(friendId);
        } catch (err: any) {
            // you can choose where to put this error (loadError or a separate removeError)
            set({ loadError: err?.message ?? "Failed to remove friend" });
        }
    },
}));
