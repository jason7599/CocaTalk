import React from "react";
import { useChatrooms } from "../context/ChatroomContext";
import { EllipsisVerticalIcon, UserPlusIcon } from "@heroicons/react/24/outline";

const ChatWindow: React.FC = () => {
    const { selectedRoom } = useChatrooms();

    if (!selectedRoom) {
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
                    <h2 className="text-lg font-semibold">{selectedRoom.name}</h2>
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
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                    />    
                </div>
        </div>
    );
};

export default ChatWindow;