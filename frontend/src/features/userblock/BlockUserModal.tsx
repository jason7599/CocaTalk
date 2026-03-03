import type React from "react";
import { useState } from "react";
import {
    NoSymbolIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useModal } from "../../shared/ModalContext";
import type { UserInfo } from "../../shared/types";
import { useBlockedUsersStore } from "./blockedUsersStore";

const BlockUserModal: React.FC<{ contact: UserInfo }> = ({ contact }) => {
    const { closeModal } = useModal();
    const blockUser = useBlockedUsersStore((s) => s.addBlock);

    const [blocking, setBlocking] = useState(false);

    const handleBlock = async () => {
        if (blocking) return;

        setBlocking(true);
        try {
            await blockUser(contact.userId);
            closeModal();
        } finally {
            setBlocking(false);
        }
    };

    return (
        <div className="w-[540px] max-w-[92vw]">
            {/* Gradient Border Wrapper */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-red-500/70 via-rose-500/50 to-pink-500/70 shadow-2xl shadow-red-500/15">
                <div className="rounded-3xl border border-white/10 bg-[#0f0f18]/90 backdrop-blur-2xl text-slate-100 overflow-hidden">

                    {/* Header */}
                    <div className="p-6 border-b border-white/10 relative">
                        {/* ambient wash (stronger red tone) */}
                        <div className="pointer-events-none absolute inset-0 opacity-80">
                            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />
                            <div className="absolute -bottom-14 -right-14 h-56 w-56 rounded-full bg-rose-500/15 blur-3xl" />
                        </div>

                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <div
                                    className="
                                        h-11 w-11 rounded-2xl
                                        bg-red-500/15 border border-red-500/30
                                        flex items-center justify-center
                                        shadow-[0_0_22px_rgba(239,68,68,0.35)]
                                    "
                                >
                                    <NoSymbolIcon className="h-6 w-6 text-red-300 drop-shadow-[0_0_14px_rgba(239,68,68,0.45)]" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold tracking-tight text-red-200">
                                        Block user
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        You’re about to block{" "}
                                        <span className="font-semibold text-slate-200">
                                            {contact.username}
                                        </span>.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={blocking}
                                className="
                                    rounded-xl p-2
                                    text-slate-300 hover:text-slate-100
                                    hover:bg-white/5 transition
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                    focus:outline-none focus:ring-2 focus:ring-red-300/30
                                "
                                aria-label="Close"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5">

                        {/* Warning Panel */}
                        <div
                            className="
                                rounded-2xl border border-red-500/20
                                bg-red-500/5
                                px-5 py-4 text-sm
                            "
                        >
                            <p className="text-slate-200 font-medium">
                                Blocking this user will:
                            </p>

                            <ul className="mt-3 space-y-2 text-slate-300">
                                <li className="flex gap-2">
                                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-red-400/70" />
                                    Remove them from your contacts
                                </li>

                                <li className="flex gap-2">
                                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-red-400/70" />
                                    Prevent them from sending you direct messages
                                </li>

                                <li className="flex gap-2">
                                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-red-400/70" />
                                    Prevent them from inviting you to group chatrooms
                                </li>

                                <li className="flex gap-2">
                                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-red-400/70" />
                                    Not notify them that they’ve been blocked
                                </li>
                            </ul>

                            <p className="mt-4 text-xs text-red-300/80">
                                You can unblock users anytime from your Settings.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={blocking}
                                className="
                                    rounded-xl px-4 py-2 text-sm font-semibold
                                    text-slate-200 bg-white/5 border border-white/10
                                    hover:bg-white/10 transition
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                    focus:outline-none focus:ring-2 focus:ring-red-300/20
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleBlock}
                                disabled={blocking}
                                className="
                                    rounded-xl px-4 py-2 text-sm font-semibold text-white
                                    bg-gradient-to-br from-red-500 via-rose-500 to-pink-500
                                    shadow-lg shadow-red-500/25
                                    hover:brightness-110 hover:-translate-y-[1px]
                                    active:translate-y-0 transition
                                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                    focus:outline-none focus:ring-2 focus:ring-red-300/40
                                "
                            >
                                {blocking ? "Blocking..." : "Block User"}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BlockUserModal;