import React from "react";
import { formatTime } from "../utils/chatFormat";
import { useAuthStore } from "../../auth/authStore";
import type { PendingUserMessage, UserMessageDto } from "../../../shared/types";
import { UserIcon } from "@heroicons/react/24/solid";
import type { MessageGrouping } from "./MessageList";

const Avatar: React.FC<{ name: string }> = ({ name }) => {
    const initial = name?.charAt(0)?.toUpperCase() ?? "?";

    return (
        <div className="relative h-8 w-8 flex-shrink-0">
            {/* Fallback circle */}
            <div className="h-full w-full rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-xs font-semibold text-white">
                {initial}
            </div>

            {/* Optional icon overlay for subtle style */}
            <UserIcon className="absolute inset-0 m-auto h-4 w-4 text-white/20" />
        </div>
    );
};

const UserMessageBubble: React.FC<{ message: UserMessageDto | PendingUserMessage; grouping?: MessageGrouping }> = ({ message, grouping }) => {
    const isMe = useAuthStore.getState().requireUser().userId === message.actorId;

    const isPersisted = !("status" in message);
    const isSending = !isPersisted && message.status === "SENDING";
    const isFailed = !isPersisted && message.status === "FAILED";

    const g = grouping ?? { isFirst: true, isLast: true };

    const bubbleShape = isMe
        ? [
            "rounded-2xl",
            g.isFirst ? "rounded-tr-2xl" : "rounded-tr-md",
            g.isLast ? "rounded-br-md" : "rounded-br-2xl",
        ].join(" ")
        : [
            "rounded-2xl",
            g.isFirst ? "rounded-tl-2xl" : "rounded-tl-md",
            g.isLast ? "rounded-bl-md" : "rounded-bl-2xl",
        ].join(" ")
    ;

    return (
        <div
            className={`flex ${isMe ? "justify-end" : "justify-start"} px-2 ${
                g.isLast ? "pt-1 pb-8" : ""
            }`}
        >
            <div className="max-w-[min(76%,650px)] flex flex-col">

                {/* Name (only for others) */}
                {!isMe && g.isFirst && (
                    <div className="ml-10 mb-1 text-xs font-medium text-slate-400 tracking-wide">
                        {message.actorName}
                    </div>
                )}

                <div
                    className={[
                        "group flex items-end gap-2",
                        isMe ? "flex-row-reverse" : "flex-row",
                    ].join(" ")}
                >
                    {/* Avatar */}
                    {!isMe && (
                        g.isFirst
                            ? <Avatar name={message.actorName} />
                            : <div className="h-8 w-8 flex-shrink-0" />
                    )}

                    {/* Bubble + status stack */}
                    <div className="flex items-end gap-2">
                        {/* Bubble */}
                        <div
                            className={[
                                "relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                                "border backdrop-blur-xl transition-all duration-200",
                                "will-change-transform break-words overflow-hidden",
                                "group-hover:scale-[1.015] group-hover:-translate-y-[1px]",
                                !isMe && !g.isLast ? "opacity-[0.85]" : "",
                                g.isLast
                                    ? "shadow-[0_10px_30px_rgba(244,63,94,0.25)]"
                                    : "shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
                                bubbleShape,

                                isMe
                                    ? [
                                        "text-white",
                                        "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500",
                                        "border-white/10",
                                        "shadow-[0_10px_30px_rgba(244,63,94,0.25)]",
                                        "rounded-br-md",
                                    ].join(" ")
                                    : [
                                        "text-slate-100",
                                        "bg-white/[0.06]",
                                        "border-white/10",
                                        "shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
                                        "rounded-bl-md",
                                    ].join(" "),

                                isSending ? "opacity-60 animate-pulse" : "",
                                isFailed ? "border-red-400/50 bg-red-500/10 text-red-200" : "",
                            ].join(" ")}
                        >
                            <div className="absolute inset-0 rounded-2xl pointer-events-none bg-white/5 opacity-0 group-hover:opacity-100 transition" />
                            {message.content}
                        </div>

                        {/* Status */}
                        <span
                            className={[
                                "text-[11px] whitespace-nowrap transition-opacity",
                                "opacity-70 group-hover:opacity-100",
                                isFailed ? "text-red-400 font-medium" : "text-slate-500",
                            ].join(" ")}
                        >
                            {isPersisted && formatTime(message.createdAt)}
                            {isSending && "Sending…"}
                            {isFailed && "Failed to send"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(UserMessageBubble);