import { create } from "zustand";
import type { UserInfo } from "../types"
import { getCurrentUser } from "../api/users";
import { login as apiLogin } from "../api/auth";

type UserStore = {
    user: UserInfo | null;
    loading: boolean;

    refreshUser: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    loading: false,

    refreshUser: async () => {
        set({ loading: true });

        try {
            const data = await getCurrentUser();
            set({ user: data });
        } catch (err) {
            console.log("Failed to set user", err);
            set({ user: null });
        } finally {
            set({ loading: false });
        }
    },

    login: async (email, password) => {
        set({ loading: true });

        try {
            const token = await apiLogin(email, password);
            localStorage.setItem("token", token);

            const user = await getCurrentUser();
            set({ user });
        } finally {
            set({ loading: false });
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        set({ user: null });
        window.location.href = "/login";
    }
}));