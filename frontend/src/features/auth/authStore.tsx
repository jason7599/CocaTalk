import { create } from "zustand";
import type { UserInfo } from "../../shared/types";
import { apiGetCurrentUser, apiLogin, apiRegister } from "./authApi";

type AuthState = {
    user: UserInfo | null;
    isLoading: boolean;

    fetchMe: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;

    requireUser: () => UserInfo;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,

    fetchMe: async () => {
        const token = localStorage.getItem("token");

        set({ isLoading: true });

        if (!token) {
            set({ user: null, isLoading: false });
            return;
        }

        try {
            const user = await apiGetCurrentUser();
            set({ user });
        } catch {
            localStorage.removeItem("token");
            set({ user: null });
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (username, password) => {
        const { token, user } = await apiLogin(username, password);

        localStorage.setItem("token", token);
        set({ user, isLoading: false });
    },

    register: async (username, password) => {
        await apiRegister(username, password);
    },

    logout: () => {
        localStorage.removeItem("token");
        set({ user: null, isLoading: false });
    },

    requireUser: (): UserInfo => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error("User not authenticated");
        return user;
    }
}));