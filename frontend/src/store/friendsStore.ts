import { create } from "zustand";
import type { UserInfo } from "../types";
import { listFriends, removeFriend as apiRemoveFriend, sendFriendRequest as apiSendFriendRequest } from "../api/friendship";

type FriendsState = {
    friends: UserInfo[];

    loading: boolean;
    loadError: string | null;

    // reducers
    setAll: (friends: UserInfo[]) => void;
    upsert: (friend: UserInfo) => void;
    removeLocal: (friendId: number) => void;

    // commands
    fetch: () => Promise<void>;
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
