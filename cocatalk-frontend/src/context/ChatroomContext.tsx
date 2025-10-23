import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loadChatrooms } from "../api/chatrooms";

export type ChatroomSummary = {
    id: number;
    name: string;
    lastMessage: string | null;
    lastMessageAt: string | null;
};

type ChatroomContextType = {
    chatrooms: ChatroomSummary[];
    selectedRoom: ChatroomSummary | null;
    selectRoom: (roomId: number) => void;
    addChatroom: (room: ChatroomSummary) => void;
    updateChatroom: (roomId: number, updates: Partial<ChatroomSummary>) => void;
    removeChatroom: (roomId: number) => void;
    reloadChatrooms: () => Promise<void>;
};

const ChatroomContext = createContext<ChatroomContextType | null>(null);

export const ChatroomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chatrooms, setChatrooms] = useState<ChatroomSummary[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatroomSummary | null>(null);

    // 🪄 Initial load
    const reloadChatrooms = async () => {
        const data = await loadChatrooms();
        setChatrooms(data);
    };

    useEffect(() => {
        reloadChatrooms();
    }, []);

    const selectRoom = (roomId: number) => {
        const room = chatrooms.find((r) => r.id === roomId) || null;
        setSelectedRoom(room);
    };

    // ✨ Public actions
    const addChatroom = (room: ChatroomSummary) => {
        setChatrooms((prev) => [room, ...prev]);
    };

    const updateChatroom = (roomId: number, updates: Partial<ChatroomSummary>) => {
        setChatrooms((prev) =>
            prev
                .map((room) => (room.id === roomId ? { ...room, ...updates } : room))
                .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime())
        );
    };

    const removeChatroom = (roomId: number) => {
        setChatrooms((prev) => prev.filter((room) => room.id !== roomId));
    };

    return (
        <ChatroomContext.Provider
            value={{
                chatrooms,
                selectedRoom,
                selectRoom,
                addChatroom,
                updateChatroom,
                removeChatroom,
                reloadChatrooms 
            }}
        >
            {children}
        </ChatroomContext.Provider>
    );
};

// 🔥 Hook for easy access anywhere
export const useChatrooms = () => {
    const ctx = useContext(ChatroomContext);
    if (!ctx) throw new Error("useChatrooms must be used inside a ChatroomProvider");
    return ctx;
};
