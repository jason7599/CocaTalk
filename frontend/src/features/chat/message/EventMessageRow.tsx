import React from "react";
import type { EventMessageDto } from "../../../shared/types";
import { formatEventMessage, formatTime } from "../utils/chatFormat";

const EventMessageRow: React.FC<{ message: EventMessageDto }> = ({ message }) => {
    const text = formatEventMessage(message);

    return (
        <div className="flex justify-center px-2 py-3">
            <div
                className={[
                    "flex items-center gap-2",
                    "px-5 py-1.5 rounded-full",
                    "text-sm font-medium tracking-wide",
                    "bg-white/[0.04] border border-white/10",
                    "backdrop-blur-md",
                    "shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
                ].join(" ")}
            >
                <span>{text}</span>
                <span className="text-[10px] text-slate-500">
                    {formatTime(message.createdAt)}
                </span>
            </div>
        </div>
    )
};

export default React.memo(EventMessageRow);