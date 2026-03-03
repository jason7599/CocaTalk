import React from "react";
import {
    UserMinusIcon,
    NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { useModal } from "../../shared/ModalContext";
import RemoveContactModal from "./RemoveContactModal";
import type { UserInfo } from "../../shared/types";
import BlockUserModal from "../userblock/BlockUserModal";

const ContactActionsModal: React.FC<{ contact: UserInfo }> = ({ contact }) => {
    const { closeModal, showModal } = useModal();

    return (
        <div className="w-[420px] max-w-[92vw]">
            {/* Gradient Border Wrapper */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-pink-500/50 via-rose-500/35 to-red-500/55 shadow-2xl shadow-rose-500/10">
                <div className="rounded-3xl border border-white/10 bg-[#0f0f18]/85 backdrop-blur-2xl text-slate-100 overflow-hidden">

                    {/* Header */}
                    <div className="relative p-6 border-b border-white/10">
                        {/* ambient wash */}
                        <div className="pointer-events-none absolute inset-0 opacity-70">
                            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                            <div className="absolute -bottom-14 -right-14 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
                        </div>

                        <div className="relative flex items-center gap-4">
                            {/* Avatar */}
                            <div
                                className="
                                    h-12 w-12 flex-none rounded-full
                                    bg-gradient-to-br from-pink-500/20 to-red-500/20
                                    ring-1 ring-white/10
                                    shadow-[0_0_28px_rgba(244,63,94,0.2)]
                                    flex items-center justify-center
                                "
                            >
                                <span className="text-sm font-semibold text-rose-200">
                                    {contact.username.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            {/* Text */}
                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold tracking-tight truncate">
                                    {contact.username}
                                </h2>
                                <p className="mt-1 text-sm text-slate-300">
                                    Manage this contact.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 space-y-3">

                        {/* Remove */}
                        <button
                            onClick={() => { showModal(<RemoveContactModal contact={contact} />) }}
                            className="
                                w-full flex items-center gap-3
                                px-4 py-3 rounded-2xl
                                text-sm font-semibold
                                text-rose-200
                                bg-rose-500/10
                                border border-rose-500/20
                                hover:bg-rose-500/15
                                transition
                            "
                        >
                            <UserMinusIcon className="h-5 w-5" />
                            Remove Contact
                        </button>

                        {/* Block */}
                        <button
                            onClick={() => { showModal(<BlockUserModal contact={contact} />) }}
                            className="
                                w-full flex items-center gap-3
                                px-4 py-3 rounded-2xl
                                text-sm font-semibold
                                text-red-300
                                bg-red-500/10
                                border border-red-500/20
                                hover:bg-red-500/15
                                transition
                            "
                        >
                            <NoSymbolIcon className="h-5 w-5" />
                            Block User
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactActionsModal;