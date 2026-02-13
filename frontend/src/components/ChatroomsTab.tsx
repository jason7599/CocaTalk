import React, { useMemo } from "react";
import { useChatroomsStore } from "../store/chatroomsStore";
import { getChatroomDisplayName } from "../utils/names";
import { useActiveRoomStore } from "../store/activeRoomStore";
import type { ChatroomSummary } from "../types";
import { ChatBubbleLeftRightIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { useModal } from "./modals/ModalContext";
import AddGroupChatModal from "./modals/AddGroupChatModal";

function formatTime(ts: string | number | Date) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts: string | number | Date) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getUnreadCount(room: ChatroomSummary) {
    return room.lastSeq - room.myLastAck;
}

const ChatroomsTab: React.FC = () => {
    const { showModal } = useModal();

    const chatrooms = useChatroomsStore((s) => s.chatrooms);
    const activeRoomId = useActiveRoomStore((s) => s.activeRoomId);
    const setActiveRoom = useActiveRoomStore((s) => s.setActiveRoom);

    const sorted = useMemo(() => {
        return [...chatrooms].sort((a, b) => {
            const ta = new Date(a.lastMessageAt ?? 0).getTime();
            const tb = new Date(b.lastMessageAt ?? 0).getTime();
            return tb - ta;
        });
    }, [chatrooms]);

    const handleClick = (chatroom: ChatroomSummary) => {
        if (chatroom.id !== activeRoomId) setActiveRoom(chatroom.id);
    };

    return (
        <>
            <div className="flex flex-col gap-4 p-4 text-slate-100">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm overflow-hidden relative">
                    {/* subtle ambient wash */}
                    <div className="pointer-events-none absolute inset-0 opacity-70">
                        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                        <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
                    </div>

                    <div className="relative p-3">
                        <div className="flex items-center gap-3">
                            <button
                                className="
                                    flex-1 inline-flex items-center justify-center gap-2
                                    rounded-xl px-4 py-3 text-sm font-semibold text-white
                                    bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                                    shadow-md shadow-rose-500/20
                                    hover:brightness-110 hover:-translate-y-[1px]
                                    active:translate-y-0 transition
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/35
                                "
                                onClick={() => showModal(<AddGroupChatModal />)}
                            >
                                <PlusCircleIcon className="h-5 w-5"/>
                                Add Groupchat
                            </button>
                        </div>
                    </div>
                </div>

                {sorted.length === 0 ? (
                    <div className="text-slate-300">
                        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]" />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-100">No chatrooms yet</div>
                                    <div className="text-sm text-slate-400">
                                        Start a DM or create a room to get chatting.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pb-2">
                        {/* List */}
                        <div className="flex flex-col gap-2">
                            {sorted.map((chatroom) => {
                                const isActive = activeRoomId === chatroom.id;
                                const lastText = chatroom.lastMessage ?? "No messages yet";
                                const lastAt = chatroom.lastMessageAt;
                                const unreadCount = getUnreadCount(chatroom);

                                return (
                                    <button
                                        key={chatroom.id}
                                        type="button"
                                        onClick={() => handleClick(chatroom)}
                                        className={[
                                            "group relative w-full text-left",
                                            "rounded-2xl border backdrop-blur-xl",
                                            "px-4 py-3 transition",
                                            "focus:outline-none focus:ring-2 focus:ring-rose-300/25",
                                            isActive
                                                ? "border-rose-500/30 bg-white/8"
                                                : "border-white/10 bg-white/5 hover:bg-white/8",
                                        ].join(" ")}
                                    >
                                        {/* Active neon rail */}
                                        <div
                                            className={[
                                                "absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity",
                                                isActive
                                                    ? "opacity-100 bg-gradient-to-b from-pink-500 to-red-500 shadow-[0_0_16px_rgba(244,63,94,0.35)]"
                                                    : "opacity-0 group-hover:opacity-60 bg-white/20",
                                            ].join(" ")}
                                            aria-hidden="true"
                                        />

                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={[
                                                            "h-9 w-9 flex-none rounded-full",
                                                            "bg-gradient-to-br from-pink-500/20 to-red-500/20",
                                                            "ring-1 ring-white/10",
                                                            isActive
                                                                ? "shadow-[0_0_18px_rgba(244,63,94,0.16)]"
                                                                : "shadow-none",
                                                        ].join(" ")}
                                                        aria-hidden="true"
                                                    />
                                                    <div className="min-w-0">
                                                        <div
                                                            className={[
                                                                "truncate font-semibold",
                                                                isActive ? "text-slate-100" : "text-slate-100/90",
                                                            ].join(" ")}
                                                        >
                                                            {getChatroomDisplayName(chatroom)}
                                                        </div>

                                                        <div
                                                            className={[
                                                                "truncate text-sm",
                                                                isActive ? "text-slate-300" : "text-slate-400",
                                                            ].join(" ")}
                                                        >
                                                            {lastText}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 pt-1 flex-none">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-xs font-semibold text-slate-300">
                                                        {formatTime(lastAt)}
                                                    </div>
                                                    {unreadCount > 0 && (
                                                        <span
                                                            className={[
                                                                "inline-flex items-center justify-center",
                                                                "min-w-[18px] h-[18px] px-1.5",
                                                                "rounded-full text-[11px] font-extrabold",
                                                                "text-white",
                                                                "bg-gradient-to-r from-rose-500 to-pink-500",
                                                                "shadow-[0_0_18px_rgba(244,63,94,0.35)]",
                                                                "ring-1 ring-white/20",
                                                            ].join(" ")}
                                                            aria-label={`${unreadCount} unread`}
                                                            title={`${unreadCount} unread`}
                                                        >
                                                            {unreadCount > 99 ? "99+" : unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[0.7rem] text-slate-500">{formatDate(lastAt)}</div>
                                            </div>
                                        </div>

                                        {isActive && (
                                            <div
                                                className="pointer-events-none absolute inset-0 rounded-2xl"
                                                style={{
                                                    boxShadow:
                                                        "0 0 0 1px rgba(244,63,94,0.10), 0 0 40px rgba(244,63,94,0.08)",
                                                }}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ChatroomsTab;
