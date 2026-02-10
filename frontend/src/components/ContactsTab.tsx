import type React from "react";
import {
    ChatBubbleLeftIcon,
    UserPlusIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import { useModal } from "../context/ModalContext";
import { useChatroomsStore } from "../store/chatroomsStore";
import { useActiveRoomStore } from "../store/activeRoomStore";
import { useContactsStore } from "../store/contactsStore";
import AddContactModal from "./modals/AddContactModal";
import RemoveContactModal from "./modals/RemoveContactModal";
import { useMemo, useState } from "react";

const ContactsTab: React.FC = () => {

    const { showModal } = useModal();

    const contacts = useContactsStore((s) => s.contacts);
    const loading = useContactsStore((s) => s.loading);

    const openDirectChatroom = useChatroomsStore((s) => s.openDirectChatroom);
    const setActiveRoom = useActiveRoomStore((s) => s.setActiveRoom);

    const handleDM = async (contactId: number) => {
        const room = await openDirectChatroom(contactId);
        setActiveRoom(room ? room.id : null);
    };

    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return contacts;

        return contacts.filter(c => 
            `${c.username}#${c.tag}`.toLowerCase().includes(q)
        );
    }, [contacts, search]);

    return (
        <div className="flex flex-col gap-4 p-4 text-slate-100">
            {/* Top Controls */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm overflow-hidden relative">
                {/* subtle ambient wash */}
                <div className="pointer-events-none absolute inset-0 opacity-70">
                    <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                    <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
                </div>

                <div className="relative p-3">
                    <div className="flex items-center gap-3">
                        {/* Add Contact */}
                        <button
                            onClick={() => showModal(<AddContactModal />)}
                            className="
                                flex-1 inline-flex items-center justify-center gap-2
                                rounded-xl px-4 py-3 text-sm font-semibold text-white
                                bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                                shadow-md shadow-rose-500/20
                                hover:brightness-110 hover:-translate-y-[1px]
                                active:translate-y-0 transition
                                focus:outline-none focus:ring-2 focus:ring-rose-300/35
                            "
                        >
                            <UserPlusIcon className="h-5 w-5" />
                            Add Contact
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm">
                <div className="p-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search contacts"
                        className="
                            w-full rounded-xl px-4 py-3
                            bg-white/5 border border-white/10
                            text-sm text-slate-100
                            placeholder:text-slate-500
                            outline-none transition
                            focus:bg-white/7 focus:border-rose-400/50
                            focus:ring-2 focus:ring-rose-300/25
                        "
                    />
                </div>
            </div>

            {/* Contacts List */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm overflow-hidden">
                {loading && contacts.length === 0 ? (
                    <div className="px-5 py-6 text-sm text-slate-300">Loading contacts…</div>
                ) : contacts.length === 0 ? (
                    <div className="px-5 py-6">
                        <p className="text-sm text-slate-300">
                            Haha friendless bastard 🥀🥀🥀🥀
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="px-5 py-6">
                        <p className="text-sm text-slate-300">
                            No contacts to match your search
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {filtered.map((contact) => (
                            <div
                                key={contact.id}
                                className="
                                    group flex items-center justify-between gap-3
                                    px-5 py-4
                                    hover:bg-white/5
                                    transition
                                "
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="
                                                h-9 w-9 flex-none rounded-full
                                                bg-gradient-to-br from-pink-500/20 to-red-500/20
                                                ring-1 ring-white/10
                                                shadow-[0_0_18px_rgba(244,63,94,0.15)]
                                            "
                                            aria-hidden="true"
                                        />
                                        <div className="min-w-0">
                                            <div className="truncate font-semibold text-slate-100">
                                                <span>{contact.username}</span>
                                                <span className="ml-0.5 text-xs font-medium text-slate-400">
                                                    #{contact.tag}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDM(contact.id)}
                                        className="
                                            inline-flex items-center gap-1.5
                                            rounded-xl px-3 py-2 text-xs font-semibold
                                            text-white
                                            bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                                            shadow-sm shadow-rose-500/25
                                            hover:brightness-110 hover:-translate-y-[1px]
                                            transition
                                            focus:outline-none focus:ring-2 focus:ring-rose-300/40
                                        "
                                    >
                                        <ChatBubbleLeftIcon className="h-4 w-4" />
                                        <span>DM</span>
                                    </button>

                                    <button
                                        onClick={() =>
                                            showModal(
                                                <RemoveContactModal
                                                    contactId={contact.id}
                                                    contactName={contact.username}
                                                />
                                            )
                                        }
                                        className="
                                            inline-flex items-center gap-1.5
                                            rounded-xl px-3 py-2 text-xs font-semibold
                                            text-rose-200
                                            bg-rose-500/10
                                            border border-rose-500/20
                                            hover:bg-rose-500/15 hover:-translate-y-[1px]
                                            transition
                                            focus:outline-none focus:ring-2 focus:ring-rose-300/25
                                        "
                                        title="Remove contact"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                        <span className="hidden sm:inline">Remove</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactsTab;