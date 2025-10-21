import type React from "react";
import { useEffect, useState } from "react";
import { loadChatrooms } from "../api/chatrooms";

export type ChatroomSummary = {
    id: number;
    name: string;
    lastMessage: string | null;
    lastMessageAt: string | null;
};

type ChatroomListProps = {
    onSelectChatroom: (id: number) => void; // callback for when a chatroom is clicked
};

const ChatroomList: React.FC<ChatroomListProps> = ({
    onSelectChatroom,
}) => {
    const [chatrooms, setChatrooms] = useState<ChatroomSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        async function fetchChatrooms() {
            setLoading(true);
            setError(null);

            try {
                const data = await loadChatrooms();
                if (!ignore) setChatrooms(data);
            } catch (err: any) {
                if (!ignore) setError(`Failed to load chatrooms: ${err}`);
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        fetchChatrooms();
        return () => {
            ignore = true;
        }
    }, []);

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto p-4 text-gray-500 italic">
                Loading Chatrooms...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 overflow-y-auto p-4 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {chatrooms.map((chat) => (
                <div
                    key={chat.id}
                    onClick={() => onSelectChatroom(chat.id)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b transition"
                >
                    <div className="font-medium">{chat.name}</div>
                    <div className="text-sm text-gray-500 truncate">
                        {chat.lastMessage ?? "No messages"}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ChatroomList;