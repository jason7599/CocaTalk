import type React from "react";
import { useState } from "react";
import {
    ArrowRightStartOnRectangleIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import ChatroomsTab from "./ChatroomsTab";
import { useModal } from "../context/ModalContext";
import { useUser } from "../context/UserContext";
import LogoutModal from "./modals/LogoutModal";
import ContactsTab from "./ContactsTab";
import { getUserDisplayName } from "../utils/names";

const Sidebar: React.FC = () => {
    const { showModal } = useModal();
    const { user } = useUser();

    const [activeTab, setActiveTab] = useState<"contacts" | "chats">("chats");

    return (
        <aside className="
                w-1/4 min-w-[320px] flex flex-col
                border-r border-white/10
                bg-gradient-to-b from-[#0d0d16]/80 via-[#0c0c14]/85 to-[#0a0a12]/90
                backdrop-blur-xl
                relative
                overflow-hidden
        ">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
            </div>

            {/* HEADER */}
            <div className="
                sticky top-0 z-10
                border-b border-white/10
                bg-[#0f0f18]/70
                backdrop-blur-xl
            ">
                {/* Row 1: user + logout */}
                <div className="flex items-center justify-between px-4 pt-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                            <UserCircleIcon className="w-10 h-10 text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]" />

                        </div>

                        <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-100 leading-tight">
                                {user ? getUserDisplayName(user) : "Loading..."}
                            </p>
                        </div>
                    </div>

                    <button
                        className="
                            p-2 rounded-full
                            hover:bg-rose-50 transition
                            focus:outline-none focus:ring-2 focus:ring-rose-200
                        "
                        title="Log out"
                        onClick={() => showModal(<LogoutModal />)}
                    >
                        <ArrowRightStartOnRectangleIcon className="w-6 h-6 text-rose-400" />

                    </button>
                </div>

                {/* Row 2: segmented control */}
                <div className="px-4 pb-4 pt-3">
                    <div className="
                        relative flex rounded-full p-1 text-sm font-semibold overflow-hidden
                        bg-white/5
                        border border-white/10
                        backdrop-blur
                    ">
                        <div
                            className={
                                "absolute top-1 bottom-1 left-1 rounded-full " +
                                "w-[calc(50%-0.25rem)] transition-transform duration-300 ease-out " +
                                "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 " +
                                "shadow-lg shadow-rose-500/30 " +
                                (activeTab === "contacts"
                                    ? "translate-x-0"
                                    : "translate-x-[calc(100%)]")
                            }
                            aria-hidden="true"
                        />
                        <button
                            type="button"
                            onClick={() => setActiveTab("contacts")}
                            className={
                                "relative z-10 flex-1 px-3 py-2 rounded-full text-center transition " +
                                (activeTab === "contacts"
                                    ? "text-gray-900"
                                    : "text-slate-400 hover:text-slate-200")
                            }
                        >
                            Contacts
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("chats")}
                            className={
                                "relative z-10 flex-1 px-3 py-2 rounded-full text-center transition " +
                                (activeTab === "chats"
                                    ? "text-gray-900"
                                    : "text-gray-500 hover:text-gray-700")
                            }
                        >
                            Chats
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto bg-black/10">
                {activeTab === "contacts" ? <ContactsTab /> : <ChatroomsTab />}
            </div>

            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"4\"/></filter><rect width=\"100\" height=\"100\" filter=\"url(%23n)\"/></svg>')",
                }}
            />
        </aside>
    );
};

export default Sidebar;
