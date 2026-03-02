import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { UserInfo } from "../../shared/types";
import api from "../../services/api";

type AuthContextType = {
    user: UserInfo | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            setUser((await api.get<UserInfo>("/users/me")).data);
        } catch {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const login = async (username: string, password: string) => {
        const token = (await api.post("/auth/login", { username, password })).data;
        localStorage.setItem("token", token);
        await fetchMe();
    };

    const register = async (username: string, password: string) => {
        await api.post("/auth/register", { username, password });
    };

    // triggers useBootstrap's clear session
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRequiredAuth = () => {
    const ctx = useAuth();

    if (!ctx.user) {
        throw new Error("useRequiredAuth must be used when user is authenticated");
    }

    return {
        ...ctx,
        user: ctx.user,
    };
};