import React, { useEffect, useRef, useState } from "react";
import { EllipsisVerticalIcon, PaperAirplaneIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useChatroomsStore } from "../store/chatroomsStore";

const ChatWindow: React.FC = () => {
    
    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const chatrooms = useChatroomsStore((s) => s.chatrooms);
    const selectedChatroomId = useChatroomsStore((s) => s.selectedChatroomId);

    const selectedChatroom = 
        selectedChatroomId &&
        (chatrooms.find((r) => r.id === selectedChatroomId) ?? null);

    useEffect(() => {
        // clear input upon switching rooms
        setMessage("");
        inputRef.current?.focus();
    }, [selectedChatroom]);

    const canSend = message.trim().length > 0;

    const handleSend = () => {
        if (!canSend) {
            return;
        }

        // TODO: actual api stuff here

        // Clear input after sending
        setMessage("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    if (!selectedChatroom) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                Select a chatroom to start chatting
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-50">
            {/* TOP BAR */}
            <div className="flex h-24 items-center justify-between p-4 border-b bg-white">
                <div>
                    <h2 className="text-lg font-semibold">{selectedChatroom.name}</h2>
                </div>

                <div>
                    <button
                        title="Invite"
                        className="p-2 rounded-full hover:bg-gray-100 transition">
                        <UserPlusIcon className="w-6 h-6 text-gray-600" />
                    </button>

                    <button
                        title="Room Options"
                        className="p-2 rounded-full hover:bg-gray-100 transition">
                        <EllipsisVerticalIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>

                {/* MESSAGES LIST */}
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    Messages
                </div>  

                {/* INPUT */}
                <div className="p-4 border-t bg-white">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a message..."
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            title="Send"
                            onClick={handleSend}
                            disabled={!canSend}
                            className={`p-2 rounded-full transition ${
                                canSend
                                    ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                                    : "bg-red-300 cursor-not-allowed opacity-60"
                            }`}
                        >
                            <PaperAirplaneIcon className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>
        </div>
    );
};

export default ChatWindow;