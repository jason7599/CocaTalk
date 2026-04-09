import React, { useEffect, useRef } from "react";
import { useActiveChatroomStore } from "../active/activeChatroomStore";
import UserMessageBubble from "./UserMessageBubble";
import { useAuthStore } from "../../auth/authStore";
import type { MessageDto } from "../../../shared/types";
import EventMessageRow from "./EventMessageRow";

const GROUP_WINDOW_MS = 5 * 60 * 1000;

export type MessageGrouping = {
    isFirst: boolean;
    isLast: boolean;
};

const MessageList: React.FC = () => {
    const roomStatus = useActiveChatroomStore((s) => s.status);
    const messages = useActiveChatroomStore((s) => s.messages);
    const pendingMessages = useActiveChatroomStore((s) => s.pendingMessages);

    const hasOlderMessages = useActiveChatroomStore((s) => s.hasOlderMessages);
    const loadingOlderMessages = useActiveChatroomStore((s) => s.loadingOlderMessages);

    const isNearBottom = useActiveChatroomStore((s) => s.isNearBottom);
    const setNearBottom = useActiveChatroomStore((s) => s.setNearBottom);

    const loadOlderMessages = useActiveChatroomStore((s) => s.loadOlderMessages);

    const activeRoomId = useActiveChatroomStore((s) => s.activeRoomId);

    const listRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const bottomSentinelRef = useRef<HTMLDivElement>(null);

    const didInitialScrollRef = useRef(false);
    const skipAutoScrollRef = useRef(false);

    const me = useAuthStore((s) => s.requireUser().userId);

    const grouping: MessageGrouping[] = React.useMemo(() => {
        return messages.map((msg, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];

            const getTime = (m: MessageDto) => new Date(m.createdAt).getTime();

            const isSameAsPrev =
                prev &&
                prev.kind === "USER" &&
                prev.actorId === msg.actorId &&
                getTime(msg) - getTime(prev) < GROUP_WINDOW_MS
            ;

            const isSameAsNext =
                next &&
                next.kind === "USER" &&
                next.actorId === msg.actorId &&
                getTime(next) - getTime(msg) < GROUP_WINDOW_MS
            ;

            return {
                isFirst: !isSameAsPrev,
                isLast: !isSameAsNext,
            };
        });
    }, [messages]);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        bottomSentinelRef.current?.scrollIntoView({ behavior, block: "end" });
    };

    // Near-bottom tracking
    useEffect(() => {
        const el = listRef.current;
        if (!el) return;

        const updateNearBottom = () => {
            const distanceFromBottom =
                el.scrollHeight - el.scrollTop - el.clientHeight;

            setNearBottom(distanceFromBottom <= 140);
        };

        updateNearBottom();
        el.addEventListener("scroll", updateNearBottom, { passive: true });

        return () => {
            el.removeEventListener("scroll", updateNearBottom);
        };
    }, [activeRoomId, setNearBottom]);

    // Infinite scroll (top)
    useEffect(() => {
        const el = listRef.current;
        const sentinel = topSentinelRef.current;
        if (!el || !sentinel || !hasOlderMessages) return;

        const io = new IntersectionObserver(
            async ([entry]) => {
                if (!entry.isIntersecting) return;
                if (loadingOlderMessages) return;
                if (roomStatus !== "READY") return;

                const prevScrollHeight = el.scrollHeight;
                const prevScrollTop = el.scrollTop;

                skipAutoScrollRef.current = true;

                await loadOlderMessages();

                requestAnimationFrame(() => {
                    const newScrollHeight = el.scrollHeight;
                    el.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
                    skipAutoScrollRef.current = false;
                });
            },
            { root: el, threshold: 0.01 }
        );

        io.observe(sentinel);
        return () => io.disconnect();
    }, [activeRoomId, roomStatus, hasOlderMessages, loadingOlderMessages, loadOlderMessages]);

    // Reset on room change
    useEffect(() => {
        didInitialScrollRef.current = false;
        skipAutoScrollRef.current = false;
        setNearBottom(true);
    }, [activeRoomId, setNearBottom]);

    // Initial scroll
    useEffect(() => {
        if (roomStatus !== "READY") return;
        if (didInitialScrollRef.current) return;
        if (messages.length === 0) return;

        scrollToBottom("auto");
        didInitialScrollRef.current = true;
    }, [roomStatus, messages.length]);

    // Auto-scroll
    useEffect(() => {
        if (skipAutoScrollRef.current) return;

        const lastPending = pendingMessages.at(-1);
        const lastMessage = messages.at(-1);

        const newestIsMine =
            (lastPending && lastPending.actorId === me) ||
            (lastMessage && lastMessage.actorId === me);

        if (isNearBottom || newestIsMine) {
            scrollToBottom(newestIsMine ? "smooth" : "auto");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages.length, pendingMessages.length, me]);

    return (<>
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4">
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
                    {messages.map((m, i) => (
                        m.kind === "USER"
                            ? <UserMessageBubble
                                message={m}
                                key={m.seq}
                                grouping={grouping[i]}
                            />
                            : <EventMessageRow 
                                message={m}
                                key={m.seq}
                            />
                    ))}
                    {pendingMessages.map((m) => (
                        <UserMessageBubble
                            message={m}
                            key={m.clientId}
                        />
                    ))}
                </div>
            )}

            {messages.length > 0 && (
                <div ref={bottomSentinelRef} className="h-6 shrink-0" />
            )}
        </div>


        {/* JUMP TO LATEST (overlay, does NOT affect scrollHeight) */}
        {!isNearBottom && (
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
    </>);
};

export default React.memo(MessageList);