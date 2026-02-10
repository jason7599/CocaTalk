import type React from "react";
import { useStomp } from "../ws/StompContext";
import { useActiveRoomStore } from "../store/activeRoomStore";
import { getChatroomDisplayName } from "../utils/names";
import { EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useChatroomsStore } from "../store/chatroomsStore";
import { useContactsStore } from "../store/contactsStore";

const ChatHeader: React.FC = () => {
    const chatEndpoint = useActiveRoomStore(s => s.chatEndpoint);
    const clearActiveRoom = useActiveRoomStore(s => s.clearActiveRoom);

    const chatrooms = useChatroomsStore(s => s.chatrooms);
    const contacts = useContactsStore(s => s.contacts);
    const addContact = useContactsStore(s => s.addContact);
    const connected = useStomp().connected;

    if (!chatEndpoint) return null;

    let displayName: string | null = null;
    let subjectUserId: number | null = null;

    if (chatEndpoint.dmProxy) {
        subjectUserId = chatEndpoint.otherUserId;
        const contact = contacts.find(c => c.id === subjectUserId);
        if (!contact) return null;
        displayName = contact.username;
    } else {
        const room = chatrooms.find(r => r.id === chatEndpoint.roomId);
        if (!room) return null;
        displayName = getChatroomDisplayName(room);
        if (room.type === "DIRECT") {
            subjectUserId = room.otherUserId;
        } else {
            subjectUserId = room.groupCreatorId;
        }
    }

    const subjectInContacts = contacts.some(c => c.id === subjectUserId);

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