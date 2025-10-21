import type React from "react";
import { Cog6ToothIcon, UserCircleIcon } from "@heroicons/react/24/outline"; // Tailwind Heroicons
import { useEffect, useRef, useState } from "react";
import { loadChatrooms } from "../api/chatrooms";

type ChatroomSummary = {
    id: number;
    name: string;
    lastMessage: string | null;
    lastMessageAt: string | null;
};

const Sidebar: React.FC = () => {

    const [chatrooms, setChatrooms] = useState<ChatroomSummary[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    // Load chatrooms
    useEffect(() => {
        try {
            loadChatrooms().then(setChatrooms);
        } catch (err: any) {
            setError(err)
        }
    }, []);


    return (
        <aside className="w-1/4 border-r bg-white flex flex-col">
            {/* TOP BAR */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="relative">
                    <UserCircleIcon className="w-10 h-10 text-red-600" />
                </div>

                <button
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    title="Settings"
                    onClick={() => console.log("⚙️ Settings clicked")}
                >
                    <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            {/* SEARCH BAR */}
            <div className="p-4">
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full p-2 rounded-full border border-gray-300"
                />
            </div>

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto">

                {error && <p className="p-4 text-red-500">{error}</p>}

                {chatrooms && chatrooms.map((chat, idx) => (
                    <div
                        key={chat.id}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b"
                    >
                        <div className="font-medium">{chat.name}</div>
                        <div className="text-sm text-gray-500">
                            {chat.lastMessage ?? "No messages yet"}
                        </div>
                        <div className="text-xs text-gray-500">
                            {chat.lastMessageAt
                                ? new Date(chat.lastMessageAt).toLocaleDateString()
                                : ""}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    )
}

export default Sidebar;