import { create } from "zustand";
import type { FriendRequestSuccessDto, UserInfo } from "../types";
import { listFriends, sendFriendRequest } from "../api/friendship";
import { usePendingRequestsStore } from "./pendingRequestsStore";

type FriendsState = {
    friends: UserInfo[];
    
    loading: boolean;
    loadError: string | null;

    friendRequestSubmitting: boolean;
    friendRequestError: string | null;
    friendRequestSuccess: FriendRequestSuccessDto | null;

    fetch: () => Promise<void>;
    sendFriendRequest: (username: string) => Promise<void>;

    // ** purely client-side helper
    addFriendToList: (friend: UserInfo) => void;

    removeFriend: (friendId: number) => Promise<void>;
};

export const useFriendsStore = create<FriendsState>((set, get) => ({
    friends: [],

    loading: false,
    loadError: null,

    friendRequestSubmitting: false,
    friendRequestError: null,
    friendRequestSuccess: null,

    // Load existing friends from backend
    fetch: async () => {
        set({ loading: true, loadError: null });
        try {
            const data = await listFriends(); // should be UserInfo[]
            set({ friends: data, loading: false });
        } catch (err: any) {
            set({
                loadError: err?.message ?? "Failed to load friends",
                loading: false,
            });
        }
    },

    // Just a local helper to push a friend into the list
    addFriendToList: (friend: UserInfo) =>
        set((state) => {
            // avoid duplicates
            if (state.friends.some((f) => f.id === friend.id)) return state;
            return { friends: [...state.friends, friend] };
        }),

    sendFriendRequest: async (username: string) => {
        const trimmed = username.trim();
        if (!trimmed) {
            set({ friendRequestError: "Enter a username!" });
            return;
        }

        set({
            friendRequestSubmitting: true,
            friendRequestError: null,
            friendRequestSuccess: null,
        });

        try {
            // This should return FriendRequestSuccessDto
            const result = await sendFriendRequest(trimmed);
            const { friendInfo, type } = result;
            
            set({ friendRequestSuccess: result });
            
            if (type === "AUTO_ACCEPT") {
                // Immediately add to friends
                set((state) => ({
                    friends: state.friends.some((f) => f.id === friendInfo.id)
                        ? state.friends
                        : [...state.friends, friendInfo]
                }));
                usePendingRequestsStore.getState().removeFromList(friendInfo.id);
            }
        } catch (err: any) {
            set({ friendRequestError: err?.message ?? "Failed to send friend request" });
        } finally {
            set({ friendRequestSubmitting: false })
        }
    },

    // TODO: hook up real API
    removeFriend: async (friendId: number) => {
        // e.g. await deleteFriend(friendId);
        const updated = get().friends.filter((f) => f.id !== friendId);
        set({ friends: updated });
    },
}));
