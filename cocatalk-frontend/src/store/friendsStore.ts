import { create } from "zustand";
import type { UserInfo } from "../types";
import { listFriends } from "../api/friendship";

type FriendsState = {
    friends: UserInfo[];
    loading: boolean;
    error: string | null;

    fetch: () => Promise<void>;
    addFriend: (friend: UserInfo) => void;
};

export const useFriendsStore = create<FriendsState>((set, get) => ({
    friends: [],
    loading: false,
    error: null,

    fetch: async () => {
        set({ loading: true, error: null });
        try {
            const data = await listFriends();
            set({ friends: data, loading: false });
        } catch(err: any) {
            set({ error: err.message, loading: false});
        }
    },

    addFriend: (friend: UserInfo) => {
        const updated = [...get().friends, friend].sort((a, b) => a.username.localeCompare(b.username));
        set({ friends: updated });
    }
}));