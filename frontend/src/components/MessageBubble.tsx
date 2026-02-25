import type React from "react";
import type { MessageResponse } from "../types";
import { useActiveRoomStore } from "../store/activeRoomStore";
import { useUserStore } from "../store/userStore";

type Props = {
    message: MessageResponse;
};

const MessageBubble: React.FC<Props> = ({ message }) => {
    const user = useUserStore((s) => s.user);
    const isMe = message.senderId === user?.id;

    const senderUsername = useActiveRoomStore(
        (s) => s.members[message.senderId]?.username ?? ""
    );

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[76%]">
                {!isMe && senderUsername && (
                    <div className="mb-1 px-1 text-xs font-semibold text-slate-400">
                        {senderUsername}
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
            </div>
        </div>
    );
};

export default MessageBubble;