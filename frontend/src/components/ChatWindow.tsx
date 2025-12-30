import React, { useEffect, useRef, useState, useCallback } from "react";
import { EllipsisVerticalIcon, PaperAirplaneIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { getChatroomDisplayName } from "../utils/chatroomName";
import { useChatroomsStore } from "../store/chatroomsStore";
import type { IMessage } from "@stomp/stompjs";
import { useStomp } from "../ws/StompContext";
import { useActiveRoomSubscription } from "../ws/useActiveRoomSub";
import { useStompPublisher } from "../ws/useStompPublisher";
import { useMessagesStore } from "../store/messagesStore";

const ChatWindow: React.FC = () => {
    const { connected } = useStomp();
    const { publish } = useStompPublisher();

    const activeRoomId = useChatroomsStore(s => s.activeRoomId);
    const activeRoom = useChatroomsStore(s =>
        s.activeRoomId == null ? null : s.chatrooms.find((r) => r.id === s.activeRoomId) ?? null
    );

    const loadInitial = useMessagesStore(s => s.loadInitial);
    const messages = useMessagesStore(s => s.messages);
    const loadingInitial = useMessagesStore(s => s.loadingInitial);
    const messageLoadError = useMessagesStore(s => s.error);
    const upsertMessage = useMessagesStore(s => s.upsert);

    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMessage("");
        inputRef.current?.focus();
    }, [activeRoomId]);

    useEffect(() => {
        if (activeRoomId != null) {
            loadInitial(activeRoomId);
        }
    }, [activeRoomId, loadInitial]);

    const onRoomMessage = useCallback((roomId: number, msg: IMessage) => {
        const body = JSON.parse(msg.body);
        upsertMessage(roomId, {
            roomId,
            senderId: body.senderId,
            seqNo: body.seqNo,
            content: body.content,
            createdAt: body.createdAt
        });
    }, [upsertMessage]);

    useActiveRoomSubscription(activeRoomId, onRoomMessage);

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

    if (!activeRoomId || !activeRoom) {
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
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400">No messages yet</div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {messages.map((m) => (
                            <div key={m.seqNo} className="text-sm">
                                <span className="font-semibold">
                                    {m.senderId}
                                </span>: {m.content}
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
