import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser } from "../api/auth";

type User = {
    id: number;
    username: string;
};

type UserContextType = {
    user: User | null;
    refreshUser: () => Promise<void>;
    logout: () => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const refreshUser = async () => {
        try {
            const data = await getCurrentUser();
            setUser(data);
        } catch (err: any) {
            console.log("Failed to load user:", err);
           setUser(null); 
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, refreshUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside UserProvider");
    return ctx;
}