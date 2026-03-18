import React, { useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import ChatHeader from "./ChatHeader";
import { useStomp } from "../../services/ws/stompContext";
import { useActiveChatroomStore } from "./active/activeChatroomStore";
import MessageList from "./message/MessageList";

const ChatWindow: React.FC = () => {
    const { connected } = useStomp();

    const activeRoomId = useActiveChatroomStore((s) => s.activeRoomId);
    const roomMeta = useActiveChatroomStore((s) => s.meta);
    const sendMessage = useActiveChatroomStore((s) => s.sendMessage);

    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const blockedByOtherUser = roomMeta.type === "DIRECT" && roomMeta.blockedByOtherUser;

    // clear message input on room change
    useEffect(() => {
        setMessage("");
        inputRef.current?.focus();
    }, [activeRoomId]);

    const trimmed = message.trimStart();
    const canSend = connected && activeRoomId != null && !blockedByOtherUser && trimmed.length > 0;

    const handleSend = () => {
        if (!canSend) return;

        sendMessage(trimmed);

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
            <div className="flex-1 flex items-center justify-center text-slate-400 text-lg bg-[#0b0b14]">
                Select a chatroom to start chatting
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0b0b14] text-slate-100 relative overflow-hidden">
            {/* Ambient background wash (subtle) */}
            <div className="pointer-events-none absolute inset-0 opacity-70">
                <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
                <div className="absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
            </div>

            <ChatHeader />
            <MessageList />

            {/* INPUT / BLOCKED STATE */}
            <div className="relative z-10 border-t border-white/10 bg-[#0f0f18]/70 backdrop-blur-xl">
                <div className="p-4">

                    {blockedByOtherUser ? (
                        <div
                            className="
                                flex items-center justify-center gap-3
                                rounded-xl px-4 py-3
                                text-sm text-red-300
                                bg-red-500/10 border border-red-500/20
                            "
                        >
                            <span className="font-medium">
                                Messaging disabled
                            </span>

                            <span className="text-red-300/80">
                                This user has blocked you.
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={connected ? "Type a message…" : "Connecting…"}
                                className="
                                    w-full px-5 py-3 rounded-full
                                    bg-white/5 border border-white/10
                                    text-slate-100 placeholder:text-slate-500
                                    outline-none transition
                                    focus:bg-white/7 focus:border-rose-400/50
                                    focus:ring-2 focus:ring-rose-300/25
                                    disabled:opacity-60
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
                                className={[
                                    "p-3 rounded-full transition-all",
                                    "focus:outline-none focus:ring-2 focus:ring-rose-300/35",
                                    canSend
                                        ? "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 hover:brightness-110 hover:scale-[1.03] shadow-lg shadow-rose-500/20"
                                        : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed",
                                ].join(" ")}
                            >
                                <PaperAirplaneIcon className="w-6 h-6 text-white -rotate-45" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
