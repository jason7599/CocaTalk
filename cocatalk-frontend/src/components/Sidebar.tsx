import type React from "react";
import {
    PlusIcon,
    ArrowRightStartOnRectangleIcon,
    UserCircleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { loadChatrooms } from "../api/chatrooms";
import { useModal } from "./MainLayout";

type ChatroomSummary = {
    id: number;
    name: string;
    lastMessage: string | null;
    lastMessageAt: string | null;
};

const Sidebar: React.FC = () => {
    const [chatrooms, setChatrooms] = useState<ChatroomSummary[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { showModal, closeModal } = useModal();

    const confirmLogout = () => {
        showModal(
            <>
                <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to log out?
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={closeModal}
                        className="px-4 py-2 rounded-md border hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/login";
                        }}
                        className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                    >
                        Log Out
                    </button>
                </div>
            </>
        )
    }

    // Load chatrooms
    useEffect(() => {
        try {
            loadChatrooms().then(setChatrooms);
        } catch (err: any) {
            setError(err);
        }
    }, []);

    const handleCreateRoom = () => {
        // TODO: implement create room flow
    };

    return (
        <aside className="w-1/4 border-r bg-white flex flex-col relative">
            {/* TOP BAR */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="relative">
                    <UserCircleIcon className="w-10 h-10 text-red-600" />
                </div>

                <div className="flex gap-2">
                    <button
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                        title="Create Room"
                        onClick={handleCreateRoom}
                    >
                        <PlusIcon className="w-6 h-6 text-green-600" />
                    </button>

                    <button
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                        title="Log out"
                        onClick={confirmLogout}
                    >
                        <ArrowRightStartOnRectangleIcon className="w-6 h-6 text-red-600" />
                    </button>
                </div>
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

                {chatrooms.map((chat) => (
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
    );
};

export default Sidebar;
