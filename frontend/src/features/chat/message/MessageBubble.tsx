import type React from "react";
import type { UserMessage } from "../../../shared/types";
import { formatTime } from "../utils/chatFormat";
import { useAuthStore } from "../../auth/authStore";

const MessageBubble: React.FC<{ message: UserMessage }> = ({ message }) => {
    const user = useAuthStore.getState().requireUser();
    const isMe = message.actorId === user.userId;

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[76%] flex flex-col">
                {!isMe && (
                    <div className="mb-1 px-1 text-xs font-semibold text-slate-400">
                        {message.actorName}
                    </div>
                )}

                <div
                    className={[
                        "group flex items-end gap-2",
                        isMe ? "flex-row-reverse" : "flex-row",
                    ].join(" ")}
                >
                    <div
                        className={[
                            "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                            "border backdrop-blur-xl transition-all",
                            isMe
                                ? [
                                    "text-white",
                                    "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500",
                                    "border-rose-400/20",
                                    "shadow-[0_8px_30px_rgba(244,63,94,0.18)]",
                                    "rounded-br-md",
                                ].join(" ")
                                : [
                                    "text-slate-100",
                                    "bg-white/5",
                                    "border-white/10",
                                    "shadow-[0_8px_26px_rgba(0,0,0,0.25)]",
                                    "rounded-bl-md",
                                ].join(" "),
                        ].join(" ")}
                    >
                        {message.content}
                    </div>

                    <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatTime(message.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;