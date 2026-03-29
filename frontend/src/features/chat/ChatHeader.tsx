import type React from "react";
import { EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useActiveChatroomStore } from "./active/activeChatroomStore";
import { useContactsStore } from "../contacts/contactsStore";
import { useStomp } from "../../services/ws/stompContext";
import { formatChatroomDisplayNameFromMembers } from "./utils/chatFormat";
import { useAuthStore } from "../auth/authStore";

const ChatHeader: React.FC = () => {
    const connected = useStomp().connected;

    const activeRoomId = useActiveChatroomStore((s) => s.activeRoomId);
    const roomStatus = useActiveChatroomStore((s) => s.status);
    const members = useActiveChatroomStore((s) => s.members);
    const roomMeta = useActiveChatroomStore((s) => s.meta);
    const clearActiveRoom = useActiveChatroomStore((s) => s.clearActiveChatroom);

    const me = useAuthStore((s) => s.requireUser());
    const contacts = useContactsStore((s) => s.contacts);
    const addContact = useContactsStore((s) => s.addContact);

    if (!activeRoomId) return null;
    if (roomStatus !== "READY") return null;

    const displayName = formatChatroomDisplayNameFromMembers(Object.values(members));
    const subjectUserId = roomMeta.type === "DIRECT"
        ? Object.values(members)[0].userId
        : roomMeta.groupCreatorId
    ;

    // Always treat as "safe" if I am the group creator
    const subjectInContacts = subjectUserId === me.userId || subjectUserId in contacts;

    const blockedByOtherUser = roomMeta.type === "DIRECT" && roomMeta.blockedByOtherUser;

    return (
        <div className="relative z-10 border-b border-white/10 bg-[#0f0f18]/70 backdrop-blur-xl">
            <div className="flex h-24 items-center justify-between px-5">
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold tracking-tight text-slate-100">
                        {displayName}

                        {!blockedByOtherUser && !subjectInContacts && (
                            <div className="mt-1 flex items-center gap-2 text-xs text-amber-400/90">
                                <span className="truncate">
                                    {roomMeta.type === "DIRECT"
                                        ? "This user is not in your contacts."
                                        : "Group creator is not in your contacts."
                                    }
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