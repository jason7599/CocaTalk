import type React from "react";
import { formatTime } from "../utils/chatFormat";
import { useAuthStore } from "../../auth/authStore";

type PropsBase = {
    userId: number;
    username: string;
    content: string;
};

export type UserMessageBubbleProps =
    | (PropsBase & { status: "PERSISTED"; createdAt: string })
    | (PropsBase & { status: "SENDING" | "FAILED" });

const UserMessageBubble: React.FC<{ message: UserMessageBubbleProps }> = ({ message }) => {
    const isMe = useAuthStore.getState().requireUser().userId === message.userId;

    const isPersisted = message.status === "PERSISTED";
    const isSending = message.status === "SENDING";
    const isFailed = message.status === "FAILED";

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} px-2 py-1`}>
            <div className="max-w-[76%] flex flex-col">

                {!isMe && (
                    <div className="mb-1 px-1 text-xs font-medium text-slate-400 tracking-wide">
                        {message.username}
                    </div>
                )}

                <div
                    className={[
                        "group flex items-end gap-2",
                        isMe ? "flex-row-reverse" : "flex-row",
                    ].join(" ")}
                >
                    {/* Bubble */}
                    <div
                        className={[
                            "relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                            "border backdrop-blur-xl transition-all duration-200",
                            "will-change-transform",

                            "break-words overflow-hidden",

                            // Hover lift
                            "group-hover:scale-[1.015] group-hover:-translate-y-[1px]",

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
                        {/* subtle inner glow */}
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
    );
};

export default UserMessageBubble;