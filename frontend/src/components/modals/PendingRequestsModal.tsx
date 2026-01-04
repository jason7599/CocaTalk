import type React from "react";
import { useEffect } from "react";
import { usePendingRequestsStore } from "../../store/pendingRequestsStore";
import { useModal } from "../../context/ModalContext";
import { BellIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";

const PendingRequestsModal: React.FC = () => {
    const { closeModal } = useModal();

    // Prefer selectors to reduce re-renders
    const requests = usePendingRequestsStore((s) => s.requests);
    const loading = usePendingRequestsStore((s) => s.loading);
    const error = usePendingRequestsStore((s) => s.error);

    const accept = usePendingRequestsStore((s) => s.accept);
    const decline = usePendingRequestsStore((s) => s.decline);
    const fetch = usePendingRequestsStore((s) => s.fetch);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const handleAccept = async (senderId: number) => {
        await accept(senderId);
    };

    const handleDecline = async (senderId: number) => {
        await decline(senderId);
    };

    return (
        <div className="w-[520px] max-w-[92vw]">
            {/* Gradient border wrapper */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-pink-500/60 via-rose-500/40 to-red-500/60 shadow-2xl shadow-rose-500/10">
                <div className="rounded-3xl border border-white/10 bg-[#0f0f18]/85 backdrop-blur-2xl text-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="relative p-6 border-b border-white/10">
                        {/* ambient wash */}
                        <div className="pointer-events-none absolute inset-0 opacity-70">
                            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                            <div className="absolute -bottom-16 -right-16 h-60 w-60 rounded-full bg-red-500/10 blur-3xl" />
                        </div>

                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <BellIcon className="h-5 w-5 text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold tracking-tight">
                                        Pending requests
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Accept or decline friend requests.
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
                                aria-label="Close"
                                title="Close"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading && (
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                                Loading requests…
                            </div>
                        )}

                        {error && !loading && (
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        {!loading && !error && requests.length === 0 && (
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                                You have no pending requests.
                            </div>
                        )}

                        {!loading && !error && requests.length > 0 && (
                            <ul className="mt-2 flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                                {requests.map((req) => {
                                    return (
                                        <li
                                            key={req.senderId}
                                            className="
                                                group flex items-center justify-between gap-3
                                                rounded-2xl border border-white/10
                                                bg-white/5 backdrop-blur
                                                px-4 py-3
                                                hover:bg-white/8 transition
                                            "
                                        >
                                            <div className="min-w-0 flex items-center gap-3">
                                                <div
                                                    className="
                                                        h-9 w-9 flex-none rounded-full
                                                        bg-gradient-to-br from-pink-500/20 to-red-500/20
                                                        ring-1 ring-white/10
                                                        shadow-[0_0_18px_rgba(244,63,94,0.12)]
                                                    "
                                                    aria-hidden="true"
                                                />
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold text-slate-100">
                                                        {req.senderName}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAccept(req.senderId)}
                                                    className="
                                                        inline-flex items-center gap-1.5
                                                        rounded-xl px-3 py-2 text-xs font-semibold text-white
                                                        bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                                                        shadow-sm shadow-rose-500/20
                                                        hover:brightness-110 hover:-translate-y-[1px]
                                                        active:translate-y-0 transition
                                                        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                                        focus:outline-none focus:ring-2 focus:ring-rose-300/35
                                                    "
                                                    title="Accept"
                                                >
                                                    <CheckIcon className="h-4 w-4" />
                                                    <span>Accept</span>
                                                </button>

                                                <button
                                                    onClick={() => handleDecline(req.senderId)}
                                                    className="
                                                        inline-flex items-center gap-1.5
                                                        rounded-xl px-3 py-2 text-xs font-semibold
                                                        text-slate-200 bg-white/5 border border-white/10
                                                        hover:bg-white/10 hover:-translate-y-[1px]
                                                        transition
                                                        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                                        focus:outline-none focus:ring-2 focus:ring-rose-300/20
                                                    "
                                                    title="Decline"
                                                >
                                                    <span>Decline</span>
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingRequestsModal;
