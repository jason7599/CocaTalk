import { create } from "zustand";
import type { UserInfo } from "../../shared/types";

type BlockedUsersState = {
    blockedUsers: Record<number, UserInfo>;

    hydrate: (users: UserInfo[]) => void;
    upsert: (user: UserInfo) => void;
    removeLocal: (targetId: number) => void;
    reset: () => void;

    addBlock: (targetId: number) => Promise<void>;
    removeBlock: (targetId: number) => Promise<void>;
};

export const useBlockedUsersStore = create<BlockedUsersState>((set, get) => ({
    blockedUsers: {},

    hydrate: (users) => {
        set({
            blockedUsers: Object.fromEntries(users.map((u) => [u.userId, u]))
        });
    },

    upsert: (user) => {
        set((state) => ({
            blockedUsers: {
                ...state.blockedUsers,
                [user.userId]: user
            }
        }));
    },

    removeLocal: (targetId) => {
        set((state) => {
            const next = { ...state.blockedUsers };
            delete next[targetId];
            return { blockedUsers: next };
        });
    },

    reset: () => {
        set({
            blockedUsers: {},
        });
    },

    addBlock: async (targetId) => {
        
    },

    removeBlock: async (targetId) => {

    },
}));