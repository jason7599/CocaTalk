import type React from "react";
import { EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useActiveChatroomStore } from "./activeChatroomStore";
import { useRequiredAuth } from "../auth/AuthProvider";
import { useContactsStore } from "../contacts/contactsStore";
import { useChatroomsStore } from "./chatroomsStore";
import { useStomp } from "../../services/ws/stompContext";

const ChatHeader: React.FC = () => {
    const activeRoomId = useActiveChatroomStore(s => s.activeRoomId);
    const clearActiveRoom = useActiveChatroomStore(s => s.clearActiveChatroom);
    
    const chatrooms = useChatroomsStore(s => s.chatrooms);
    const contacts = useContactsStore(s => s.contacts);
    const addContact = useContactsStore(s => s.addContact);
    
    const connected = useStomp().connected;
    
    const { user } = useRequiredAuth();
    
    if (!activeRoomId) return null;

    let displayName: string | null = null;
    let subjectUserId: number | null = null;

    return (
        <div className="relative z-10 border-b border-white/10 bg-[#0f0f18]/70 backdrop-blur-xl">
            <div className="flex h-24 items-center justify-between px-5">
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-slate-100">
                        {displayName}

                        {subjectUserId != null && !subjectInContacts && (
                            <div className="mt-1 flex items-center gap-2 text-xs text-amber-400/90">
                                <span className="truncate">
                                    This user isn't in your contact list.
                                </span>

                                <button
                                    onClick={() => addContact(subjectUserId)}
                                    className="
                                        text-slate-200/90 hover:text-slate-100
                                        underline-offset-2 hover:underline transition
                                    "
                                >
                                    Add
                                </button>

                                <button
                                    // todo: block
                                    className="
                                        text-red-400/80 hover:text-red-400
                                        underline-offset-2 hover:underline transition
                                    "
                                >
                                    Block
                                </button>
                            </div>
                        )}
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