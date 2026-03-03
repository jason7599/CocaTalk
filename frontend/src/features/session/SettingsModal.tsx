import React, { useState } from "react";
import {
    XMarkIcon,
    NoSymbolIcon,
    SpeakerXMarkIcon,
    ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useModal } from "../../shared/ModalContext";
import LogoutModal from "../auth/LogoutModal";
import BlockedUsersPanel from "../userblock/BlockedUsersPanel";

type Tab = "blocked" | "muted";

const SettingsModal: React.FC = () => {
    const { closeModal, showModal } = useModal();
    const [activeTab, setActiveTab] = useState<Tab>("blocked");

    return (
        <div className="w-[760px] max-w-[95vw]">
            {/* Gradient Border Wrapper */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-pink-500/50 via-rose-500/35 to-red-500/55 shadow-2xl shadow-rose-500/10">
                <div className="rounded-3xl border border-white/10 bg-[#0f0f18]/85 backdrop-blur-2xl text-slate-100 overflow-hidden">

                    {/* HEADER */}
                    <div className="relative p-6 border-b border-white/10">
                        <div className="pointer-events-none absolute inset-0 opacity-70">
                            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                            <div className="absolute -bottom-14 -right-14 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
                        </div>

                        <div className="relative flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Settings
                                </h2>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-xl hover:bg-white/10 transition"
                            >
                                <XMarkIcon className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    {/* BODY */}
                    <div className="flex p-6 gap-6 relative">

                        {/* LEFT SELECTOR */}
                        <div className="w-30 space-y-2">
                            <SelectorItem
                                active={activeTab === "blocked"}
                                icon={<NoSymbolIcon className="w-5 h-5" />}
                                label="Blocked Users"
                                onClick={() => setActiveTab("blocked")}
                            />

                            <SelectorItem
                                active={activeTab === "muted"}
                                icon={<SpeakerXMarkIcon className="w-5 h-5" />}
                                label="Muted Chatrooms"
                                onClick={() => setActiveTab("muted")}
                            />
                        </div>

                        {/* Soft Separator */}
                        <div className="relative w-4 flex justify-center">
                            <div className="
                                w-px h-full
                                bg-gradient-to-b
                                from-transparent
                                via-white/10
                                to-transparent"
                            />
                        </div>

                        {/* RIGHT CONTENT */}
                        <div className="flex-1 min-h-[320px] max-h-[320px] overflow-y-auto space-y-3 pr-1">
                            {activeTab === "blocked" && <BlockedUsersPanel />}
                            {/* {activeTab === "muted" && <MutedRoomsPanel />} */}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="px-6 pb-6 pt-6 border-t border-white/10 flex justify-end">
                        <button
                            onClick={() => showModal(<LogoutModal />)}
                            className="
                                inline-flex items-center gap-2
                                rounded-xl px-4 py-2 text-sm font-semibold text-white
                                bg-gradient-to-br from-rose-500 via-red-500 to-pink-500
                                shadow-lg shadow-rose-500/20
                                hover:brightness-110 hover:-translate-y-[1px]
                                active:translate-y-0 transition
                                focus:outline-none focus:ring-2 focus:ring-rose-300/35
                            "
                        >
                            <ArrowRightStartOnRectangleIcon className="w-6 h-6" />
                            Log Out
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

const SelectorItem: React.FC<{
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}> = ({ active, icon, label, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`
        relative w-full flex items-center gap-3
        px-4 py-3 rounded-2xl text-sm font-medium
        transition-all duration-300
        ${active
                    ? "bg-gradient-to-br from-pink-500/20 via-rose-500/15 to-red-500/20 border border-rose-500/30 text-rose-200 shadow-md shadow-rose-500/10"
                    : "bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                }
      `}
        >
            <div className={active ? "text-rose-300" : ""}>{icon}</div>
            {label}
        </button>
    );
};

export default SettingsModal;