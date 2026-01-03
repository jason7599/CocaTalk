import React, { useEffect, useRef, useState } from "react";
import { EllipsisVerticalIcon, PaperAirplaneIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { getChatroomDisplayName } from "../utils/chatroomName";
import { useStomp } from "../ws/StompContext";
import { useStompPublisher } from "../ws/useStompPublisher";
import { useActiveRoomStore } from "../store/activeRoomStore";
import { useChatroomsStore } from "../store/chatroomsStore";

const ChatWindow: React.FC = () => {
    const { connected } = useStomp();
    const { publish } = useStompPublisher();

    const activeRoomId = useActiveRoomStore(s => s.activeRoomId); // * re-renders upon activeRoomId change
    const activeRoom = useChatroomsStore((s) =>
        activeRoomId === null
            ? null
            : s.chatrooms.find((r) => r.id === activeRoomId) ?? null
    );

    const roomStatus = useActiveRoomStore(s => s.status);
    const messages = useActiveRoomStore(s => s.messages);
    const hasMoreMessages = useActiveRoomStore(s => s.hasMoreMessages);
    const loadingOlderMessages = useActiveRoomStore(s => s.loadingOlderMessages);
    const loadOlderMessages = useActiveRoomStore(s => s.loadOlderMessages);

    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMessage("");
        inputRef.current?.focus();
    }, [activeRoomId]);

    const canSend = connected && activeRoomId != null && message.trim().length > 0;

    const handleSend = () => {
        if (!canSend || activeRoomId == null) return;
        publish(`/app/chat.send.${activeRoomId}`, { content: message });
        setMessage("");
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    if (!activeRoomId) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                Select a chatroom to start chatting
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-50">
            <div className="flex h-24 items-center justify-between p-4 border-b bg-white">
                <div>
                    <h2 className="text-lg font-semibold">{getChatroomDisplayName(activeRoom)}</h2>
                    {!connected && <div className="text-xs text-gray-400">Connecting…</div>}
                </div>

                <div>
                    <button title="Invite" className="p-2 rounded-full hover:bg-gray-100 transition">
                        <UserPlusIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <button title="Room Options" className="p-2 rounded-full hover:bg-gray-100 transition">
                        <EllipsisVerticalIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {roomStatus === "LOADING" ? (
                    <div className="h-full flex items-center justify-center text-gray-400">Loading…</div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400">No messages yet</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {hasMoreMessages && (
                            <button
                                onClick={loadOlderMessages}
                                disabled={loadingOlderMessages}
                                className="self-center mb-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-60"
                            >
                                {loadingOlderMessages ? "Loading…" : "Load older"}
                            </button>
                        )}

                        {messages.map((m) => (
                            <div key={m.seqNo} className="text-sm">
                                <span className="font-semibold">{m.senderId}</span>: {m.content}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-white">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={connected ? "Type a message..." : "Connecting..."}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!connected}
                    />
                    <button
                        title="Send"
                        onClick={handleSend}
                        disabled={!canSend}
                        className={`p-2 rounded-full transition ${canSend ? "bg-red-600 hover:bg-red-700 cursor-pointer" : "bg-red-300 cursor-not-allowed opacity-60"
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
