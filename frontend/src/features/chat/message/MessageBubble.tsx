import type React from "react";
import { useRequiredAuth } from "../../auth/AuthProvider";
import type { UserMessage } from "../../../shared/types";
import { formatTime } from "../utils/chatFormat";

const MessageBubble: React.FC<{ message: UserMessage }> = ({ message }) => {
    const { user } = useRequiredAuth();
    const isMe = message.actorId === user.userId;

    return (
        <div className={[
            "group flex w-full",
            isMe ? "justify-end" : "justify-start"
        ].join(" ")}>
            <div className="max-w-[76%] flex flex-col">
                {/* sender + timestamp */}
                {!isMe && (
                    <div className="mb-1 flex items-center gap-2 px-1 text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">
                            {message.actorName}
                        </span>
                        <span className="opacity-60">
                            {formatTime(message.createdAt)}
                        </span>
                    </div>
                )}

                <div
                    className={[
                        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                        "border backdrop-blur-xl",
                        "transition",
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

                {isMe && (
                    <div className="mt-1 px-1 text-xs text-right text-slate-500">
                        {formatTime(message.createdAt)}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MessageBubble;