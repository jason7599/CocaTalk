import React from "react";
import { useChatroomsStore } from "../store/chatroomsStore";
import { getChatroomDisplayName } from "../utils/chatroomName";

const ChatroomList: React.FC = () => {
    const chatrooms = useChatroomsStore(s => s.chatrooms);
    const activeRoomId = useChatroomsStore(s => s.activeRoomId);
    const setActiveRoomId = useChatroomsStore(s => s.setActiveRoomId);

    if (chatrooms.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                No chatrooms yet — create one to get started!
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {chatrooms.map((chatroom) => (
                <div
                    key={chatroom.id}
                    onClick={() => setActiveRoomId(chatroom.id)}
                    className={`px-4 py-3 hover:bg-gray-100 cursor-pointer border-b transition ${
                        activeRoomId === chatroom.id ? "bg-red-100" : ""   
                    }`}
                >
                    <div className="font-medium">{getChatroomDisplayName(chatroom)}</div>
                    <div className="text-sm text-gray-500">
                        {chatroom.lastMessage ?? "No messages yet"}
                    </div>
                    <div className="text-xs text-gray-400">
                        {new Date(chatroom.lastMessageAt).toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatroomList;
