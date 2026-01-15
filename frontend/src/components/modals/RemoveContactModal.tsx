import type React from "react";
import { useModal } from "../../context/ModalContext";
import { useContactsStore } from "../../store/contactsStore";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

type RemoveContactModalProps = {
    contactId: number;
    contactName: string;
};

const RemoveContactModal: React.FC<RemoveContactModalProps> = ({
    contactId,
    contactName,
}) => {
    const { closeModal } = useModal();
    const removeContact = useContactsStore((s) => s.removeContact);

    const handleRemove = async () => {
        await removeContact(contactId);
        closeModal();
    }

    return (
        <div className="w-[520px] max-w-[92vw]">
            {/* Gradient border wrapper */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-pink-500/60 via-rose-500/40 to-red-500/60 shadow-2xl shadow-rose-500/10">
                <div className="rounded-3xl border border-white/10 bg-[#0f0f18]/85 backdrop-blur-2xl text-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 relative">
                        {/* ambient wash */}
                        <div className="pointer-events-none absolute inset-0 opacity-70">
                            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                            <div className="absolute -bottom-14 -right-14 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
                        </div>

                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <div
                                    className="
                                        h-10 w-10 rounded-2xl
                                        bg-rose-500/10 border border-rose-500/20
                                        flex items-center justify-center
                                        shadow-[0_0_18px_rgba(244,63,94,0.18)]
                                    "
                                >
                                    <ExclamationTriangleIcon className="h-5 w-5 text-rose-200 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold tracking-tight">
                                        Remove contact
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        You’re about to remove{" "}
                                        <span className="font-semibold text-slate-200">
                                            {contactName}
                                        </span>{" "}
                                        from your contacts.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="
                                    rounded-xl p-2
                                    text-slate-300 hover:text-slate-100
                                    hover:bg-white/5 transition
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/25
                                "
                                aria-label="Close"
                                title="Close"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="
                                    rounded-xl px-4 py-2 text-sm font-semibold
                                    text-slate-200 bg-white/5 border border-white/10
                                    hover:bg-white/10 transition
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/20
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleRemove}
                                className="
                                    rounded-xl px-4 py-2 text-sm font-semibold text-white
                                    bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                                    shadow-lg shadow-rose-500/20
                                    hover:brightness-110 hover:-translate-y-[1px]
                                    active:translate-y-0 transition
                                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/35
                                "
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RemoveContactModal;