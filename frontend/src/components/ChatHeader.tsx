import type React from "react";
import { useStomp } from "../ws/StompContext";
import { useActiveRoomStore } from "../store/activeRoomStore";
import { getChatroomDisplayName } from "../utils/names";
import { EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useChatroomsStore } from "../store/chatroomsStore";

const ChatHeader: React.FC = () => {
    const { connected } = useStomp();

    const activeRoomId = useActiveRoomStore((s) => s.activeRoomId);
    const room = useChatroomsStore((s) => s.chatrooms.find(r => r.id === activeRoomId));

    const clearActiveRoom = useActiveRoomStore((s) => s.clearActiveRoom);

    return (
        <div className="relative z-10 border-b border-white/10 bg-[#0f0f18]/70 backdrop-blur-xl">
            <div className="flex h-24 items-center justify-between px-5">
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-slate-100">
                        {room && getChatroomDisplayName(room)}
                    </h2>

                    {!connected && (
                        <div className="text-xs text-slate-400">
                            Connecting...
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        title="Room Options"
                        className="p-2 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-white/5 transition"
                    >
                        <EllipsisVerticalIcon className="w-6 h-6" />
                    </button>

                    <button
                        onClick={clearActiveRoom}
                        className="p-2 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-white/5 transition"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;