import type React from "react";
import { useModal } from "../../context/ModalContext";
import { useContactsStore } from "../../store/contactsStore";
import { useMemo, useState } from "react";
import { CheckIcon, UserGroupIcon, XMarkIcon } from "@heroicons/react/24/outline";

const AddGroupChatModal: React.FC = () => {
    const { closeModal } = useModal();
    const contacts = useContactsStore((s) => s.contacts);

    const [selected, setSelected] = useState<Set<number>>(new Set());

    const toggle = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    const canCreate = selected.size > 0;

    const helperText = useMemo(() => {
        if (contacts.length === 0) return "You need contacts to start a group chat.";
        if (selected.size === 0) return "Pick at least one person.";
        return `${selected.size} participant${selected.size > 1 ? "s" : ""} selected.`;
    }, [contacts.length, selected.size]);
    return (
        <div className="w-[560px] max-w-[92vw]">
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-pink-500/60 via-rose-500/40 to-red-500/60 shadow-2xl shadow-rose-500/10">
                <div className="rounded-3xl border border-white/10 bg-[#0f0f18]/85 backdrop-blur-2xl text-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 relative">
                        <div className="pointer-events-none absolute inset-0 opacity-70">
                            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                            <div className="absolute -bottom-14 -right-14 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
                        </div>

                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <UserGroupIcon className="h-5 w-5 text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold tracking-tight">
                                        Create group chat
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {helperText}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={closeModal}
                                className="
                                    rounded-xl p-2
                                    text-slate-300 hover:text-slate-100
                                    hover:bg-white/5 transition
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/25
                                "
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Selected users */}
                    {selected.size > 0 && (
                        <div className="p-4">
                            <div className="flex flex-wrap gap-2">
                                {[...selected].map((id) => {
                                    const user = contacts.find((c) => c.id === id);
                                    if (!user) return null;

                                    return (
                                        <div
                                            key={id}
                                            className="
                                                group inline-flex items-center gap-2
                                                rounded-full px-3 py-1.5
                                                bg-gradient-to-br from-pink-500/20 to-red-500/20
                                                border border-white/10
                                                shadow-[0_0_18px_rgba(244,63,94,0.15)]
                                            "
                                        >
                                            <div
                                                className="
                                                    h-4 w-4 rounded-full
                                                    bg-gradient-to-br from-pink-500 to-red-500
                                                "
                                            />
                                            <span className="text-sm font-semibold text-slate-100">
                                                {user.username}
                                            </span>
                                            <button
                                                onClick={() => toggle(id)}
                                                className="
                                                    rounded-full p-0.5
                                                    text-slate-300 hover:text-white
                                                    hover:bg-white/10
                                                    transition
                                                "
                                            >
                                                <XMarkIcon className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Body */}
                    <div className="px-4 max-h-[420px] overflow-y-auto">
                        {contacts.length === 0 ? (
                            <div className="px-4 py-10 text-center text-sm text-slate-400">
                                No contacts bro 🥀🥀🥀
                            </div>
                        ) : (
                            <div className="divide-y divide-white/10">
                                {contacts.map((c) => {
                                    const checked = selected.has(c.id);

                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => toggle(c.id)}
                                            className="
                                                w-full flex items-center justify-between gap-3
                                                px-4 py-3 text-left
                                                hover:bg-white/5 transition
                                                focus:outline-none
                                            "
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className="
                                                        h-9 w-9 rounded-full
                                                        bg-gradient-to-br from-pink-500/20 to-red-500/20
                                                        ring-1 ring-white/10
                                                    "
                                                />
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold">
                                                        <span>{c.username}</span>
                                                        <span className="ml-0.5 text-xs font-medium text-slate-400">
                                                            #{c.tag}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Checkbox */}
                                            <div
                                                className={`
                                                    h-6 w-6 rounded-lg border
                                                    flex items-center justify-center
                                                    transition
                                                    ${checked
                                                        ? "bg-gradient-to-br from-pink-500 to-red-500 border-transparent shadow-md shadow-rose-500/30"
                                                        : "border-white/20 bg-white/5"
                                                    }
                                                `}
                                            >
                                                {checked && <CheckIcon className="h-4 w-4 text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 flex justify-end gap-2">
                        <button
                            onClick={closeModal}
                            className="
                                rounded-xl px-4 py-2 text-sm font-semibold
                                text-slate-200 bg-white/5 border border-white/10
                                hover:bg-white/10 transition
                                focus:outline-none focus:ring-2 focus:ring-rose-300/20
                            "
                        >
                            Cancel
                        </button>

                        <button
                            disabled={!canCreate}
                            className="
                                rounded-xl px-4 py-2 text-sm font-semibold text-white
                                bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                                shadow-lg shadow-rose-500/20
                                hover:brightness-110 hover:-translate-y-[1px]
                                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                transition
                                focus:outline-none focus:ring-2 focus:ring-rose-300/35
                            "
                        >
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddGroupChatModal;