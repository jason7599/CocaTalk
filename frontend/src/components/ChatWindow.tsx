import React, { useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useStomp } from "../ws/StompContext";
import { useActiveRoomStore } from "../store/activeRoomStore";
import { useChatroomsStore } from "../store/chatroomsStore";
import MessageBubble from "./MessageBubble";
import ChatHeader from "./ChatHeader";

const ChatWindow: React.FC = () => {
    const { connected } = useStomp();

    const chatEndpoint = useActiveRoomStore((s) => s.chatEndpoint);
    const activeRoomId = chatEndpoint?.dmProxy ? -1 : chatEndpoint?.roomId;
    const activeRoom = useChatroomsStore((s) =>
        activeRoomId === null
            ? null
            : s.chatrooms.find((r) => r.id === activeRoomId) ?? null
    );

    const sendMessage = useActiveRoomStore((s) => s.sendMessage);

    const roomStatus = useActiveRoomStore((s) => s.status);
    const messages = useActiveRoomStore((s) => s.messages);

    const hasMoreMessages = useActiveRoomStore((s) => s.hasMoreMessages);
    const loadingOlderMessages = useActiveRoomStore((s) => s.loadingOlderMessages);
    const loadOlderMessages = useActiveRoomStore((s) => s.loadOlderMessages);
    const setNearBottomInStore = useActiveRoomStore((s) => s.setNearBottom);

    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMessage("");
        inputRef.current?.focus();
    }, [activeRoomId]);

    const trimmed = message.trimStart();
    const canSend = connected && activeRoomId != null && trimmed.length > 0;

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

    // scroll behavior
    const didInitialScrollRef = useRef(false);
    const listRef = useRef<HTMLDivElement>(null);
    const skipAutoScrollRef = useRef(false);
    const [isNearBottom, setIsNearBottom] = useState(true);

    // Sentinel refs
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const bottomSentinelRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        bottomSentinelRef.current?.scrollIntoView({ behavior, block: "end" });
    };

    // NEW: Near-bottom tracking via bottom sentinel (no scroll math)
    useEffect(() => {
        const root = listRef.current;
        const bottom = bottomSentinelRef.current;
        if (!root || !bottom) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                const near = entry.isIntersecting;
                setIsNearBottom(near);
                setNearBottomInStore(near);
            },
            {
                root,
                threshold: 0.01,
                rootMargin: "0px 0px 140px 0px",
            }
        );

        io.observe(bottom);
        return () => io.disconnect();
    }, [activeRoomId, setNearBottomInStore]);

    // Infinite scroll (load older messages when top sentinel appears)
    useEffect(() => {
        const el = listRef.current;
        const sentinel = topSentinelRef.current;
        if (!el || !sentinel) return;

        if (!hasMoreMessages) return;

        const io = new IntersectionObserver(
            async ([entry]) => {
                if (!entry.isIntersecting) return;
                if (loadingOlderMessages) return;
                if (roomStatus !== "READY") return;

                // Preserve scroll position when older messages are prepended
                const prevScrollHeight = el.scrollHeight;
                const prevScrollTop = el.scrollTop;

                skipAutoScrollRef.current = true;

                await loadOlderMessages();

                requestAnimationFrame(() => {
                    const newScrollHeight = el.scrollHeight;
                    el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);

                    // allow auto-scroll again after this prepend cycle
                    skipAutoScrollRef.current = false;
                });
            },
            { root: el, threshold: 0.01 }
        );

        io.observe(sentinel);
        return () => io.disconnect();
    }, [
        activeRoomId,
        roomStatus,
        hasMoreMessages,
        loadingOlderMessages,
        loadOlderMessages,
    ]);

    // Reset scroll flags when switching rooms
    useEffect(() => {
        didInitialScrollRef.current = false;
        skipAutoScrollRef.current = false;
        setIsNearBottom(true);
        setNearBottomInStore(true);
    }, [activeRoomId, setNearBottomInStore]);

    // Initial scroll to bottom once messages render
    useEffect(() => {
        if (roomStatus !== "READY") return;
        if (didInitialScrollRef.current) return;
        if (messages.length === 0) return;

        scrollToBottom("auto");
        didInitialScrollRef.current = true;
    }, [roomStatus, messages.length]);

    // Auto-scroll on new messages ONLY if user is near bottom and we aren't prepending
    useEffect(() => {
        if (skipAutoScrollRef.current) return;
        if (!isNearBottom) return;

        scrollToBottom("smooth");
    }, [messages.length, isNearBottom]);

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

            {activeRoom && <ChatHeader />}

            {/* LIST */}
            <div ref={listRef} className="relative z-0 flex-1 overflow-y-auto px-4 py-4">
                {/* list surface gradient */}
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#0b0b14] via-[#0c0c16] to-[#0a0a12]" />

                {/* TOP sentinel (for infinite scroll up) */}
                <div ref={topSentinelRef} className="h-px" />

                {roomStatus === "READY" && loadingOlderMessages && (
                    <div className="mb-3 flex justify-center text-xs text-slate-400">
                        Loading older messages...
                    </div>
                )}

                {roomStatus === "LOADING" ? (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        Loading…
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        No messages yet
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {messages.map((m) => (
                            <MessageBubble message={m} key={m.seqNo} />
                        ))}

                    </div>
                )}

                {/* BOTTOM sentinel (for jump-to-latest + auto-scroll) */}
                <div ref={bottomSentinelRef} className="h-6 shrink-0" />

            </div>

            {/* JUMP TO LATEST (overlay, does NOT affect scrollHeight) */}
            {activeRoomId != null && !isNearBottom && (
                <div className="pointer-events-none absolute bottom-28 left-0 right-0 z-20 flex justify-center">
                    <button
                        onClick={() => scrollToBottom("smooth")}
                        className="
                            pointer-events-auto
                            rounded-full px-4 py-2 text-xs font-semibold
                            text-slate-100
                            border border-white/10 bg-white/5 backdrop-blur-xl
                            hover:bg-white/10 transition
                            shadow-[0_12px_30px_rgba(0,0,0,0.35)]
                            focus:outline-none focus:ring-2 focus:ring-rose-300/25
                        "
                    >
                        Jump to latest
                    </button>
                </div>
            )}

            {/* INPUT */}
            <div className="relative z-10 border-t border-white/10 bg-[#0f0f18]/70 backdrop-blur-xl">
                <div className="p-4">
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
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
