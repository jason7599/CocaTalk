import React, { useEffect, useRef, useState } from "react";
import { EllipsisVerticalIcon, PaperAirplaneIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { getChatroomDisplayName } from "../utils/chatroomName";
import { useStomp } from "../ws/StompContext";
import { useStompPublisher } from "../ws/useStompPublisher";
import { useActiveRoomStore } from "../store/activeRoomStore";
import { useChatroomsStore } from "../store/chatroomsStore";
import type { MessageResponse } from "../types";
import { useUser } from "../context/UserContext";

const MessageBubble = ({ message }: { message: MessageResponse}) => {
    const { user } = useUser();
    const isMe = message.senderId === user?.id;

    const senderUsername = useActiveRoomStore(
        s => s.members[message.senderId]?.username ?? ""
    );

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div
                className={`
                    max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed
                    shadow-sm transition-all
                    ${isMe
                        ? "bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md border"
                    }
                `}
            >
                {!isMe && (
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                        {senderUsername}
                    </div>
                )}
                {message.content}
            </div>
        </div>
    );
};

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

    if (activeRoomId == null) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                Select a chatroom to start chatting
            </div>
        );
    }

    return (
        // HEADER
        <div className="flex-1 flex flex-col bg-gray-50">
            <div className="flex h-24 items-center justify-between p-4 border-b bg-white">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                        {getChatroomDisplayName(activeRoom)}
                    </h2>
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

            {/* LIST */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100">
                {roomStatus === "LOADING" ? (
                    <div className="h-full flex items-center justify-center text-gray-400">Loading…</div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400">No messages yet</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {messages.map((m) =>
                            <MessageBubble message={m} key={m.seqNo}/>
                        )}
                    </div>
                )}
            </div>

            {/* INPUT */}
            <div className="p-4 border-t bg-white">
                <div className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={connected ? "Type a message..." : "Connecting..."}
                        className="
                            w-full px-4 py-3 rounded-full
                            bg-gray-100 focus:bg-white
                            border border-transparent
                            focus:border-red-400
                            focus:ring-2 focus:ring-red-300
                            outline-none transition
                        "
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!connected}
                    />
                    <button
                        title="Send"
                        onClick={handleSend}
                        disabled={!canSend}
                        className={`
                            p-3 rounded-full transition-all
                            ${canSend
                                ? "bg-gradient-to-br from-red-500 to-pink-500 hover:scale-105 shadow-lg"
                                : "bg-gray-500 opacity-50"
                            }
                        `}
                    >
                        <PaperAirplaneIcon className="w-6 h-6 text-white -rotate-45" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
