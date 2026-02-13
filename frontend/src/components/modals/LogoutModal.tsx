import React from "react";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useModal } from "./ModalContext";
import { useUserStore } from "../../store/userStore";

const LogoutModal: React.FC = () => {
    const { closeModal } = useModal();
    const logout = useUserStore((s) => s.logout);

    return (
        <div className="w-[420px] max-w-[92vw]">
            {/* Gradient border wrapper */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-pink-500/50 via-rose-500/35 to-red-500/55 shadow-2xl shadow-rose-500/10">
                <div className="rounded-3xl border border-white/10 bg-[#0f0f18]/85 backdrop-blur-2xl text-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="relative p-6 border-b border-white/10">
                        {/* ambient wash */}
                        <div className="pointer-events-none absolute inset-0 opacity-70">
                            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                            <div className="absolute -bottom-14 -right-14 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
                        </div>

                        <div className="relative flex items-start gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                <ArrowRightStartOnRectangleIcon className="h-5 w-5 text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]" />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Log out?
                                </h2>
                                <p className="mt-1 text-sm text-slate-300">
                                    You’ll be signed out of your account on this device.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 flex justify-end gap-2">
                        <button
                            onClick={closeModal}
                            className="
                                rounded-xl px-4 py-2 text-sm font-semibold
                                text-slate-200 bg-white/5 border border-white/10
                                hover:bg-white/10 transition
                                disabled:opacity-60 disabled:cursor-not-allowed
                                focus:outline-none focus:ring-2 focus:ring-rose-300/25
                            "
                        >
                            Cancel
                        </button>

                        <button
                            onClick={logout}
                            className="
                                rounded-xl px-4 py-2 text-sm font-semibold text-white
                                bg-gradient-to-br from-rose-500 via-red-500 to-pink-500
                                shadow-lg shadow-rose-500/20
                                hover:brightness-110 hover:-translate-y-[1px]
                                active:translate-y-0 transition
                                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                focus:outline-none focus:ring-2 focus:ring-rose-300/35
                            "
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
