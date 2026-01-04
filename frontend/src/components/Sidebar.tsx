import type React from "react";
import { useMemo, useState } from "react";
import {
    ArrowRightStartOnRectangleIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import ChatroomsTab from "./ChatroomsTab";
import { useModal } from "../context/ModalContext";
import { useUser } from "../context/UserContext";
import { usePendingRequestsStore } from "../store/pendingRequestsStore";
import LogoutModal from "./modals/LogoutModal";
import FriendsTab from "./FriendsTab";

const Sidebar: React.FC = () => {
    const { showModal } = useModal();
    const { user } = useUser();

    const [activeTab, setActiveTab] = useState<"friends" | "rooms">("rooms");

    const pendingCount = usePendingRequestsStore((s) => s.requests.length);

    const pendingLabel = useMemo(() => {
        if (pendingCount <= 0) return "";
        return String(pendingCount);
    }, [pendingCount]);

    return (
        <aside className="w-1/4 min-w-[320px] border-r bg-white/70 backdrop-blur flex flex-col">
            {/* HEADER */}
            <div className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
                {/* Row 1: user + logout */}
                <div className="flex items-center justify-between px-4 pt-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                            <UserCircleIcon className="w-10 h-10 text-rose-500" />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900 leading-tight">
                                {user?.username}
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
                        <ArrowRightStartOnRectangleIcon className="w-6 h-6 text-rose-500" />
                    </button>
                </div>

                {/* Row 2: segmented control */}
                <div className="px-4 pb-4 pt-3">
                    <div className="relative flex rounded-full bg-gray-100/80 p-1 text-sm font-semibold overflow-hidden">
                        <div
                            className={
                                "absolute top-1 bottom-1 left-1 rounded-full bg-white shadow-sm " +
                                "w-[calc(50%-0.25rem)] transition-transform duration-200 ease-out " +
                                (activeTab === "friends"
                                    ? "translate-x-0"
                                    : "translate-x-[calc(100%)]")
                            }
                            aria-hidden="true"
                        />

                        <button
                            type="button"
                            onClick={() => setActiveTab("friends")}
                            className={
                                "relative z-10 flex-1 px-3 py-2 rounded-full text-center transition " +
                                (activeTab === "friends"
                                    ? "text-gray-900"
                                    : "text-gray-500 hover:text-gray-700")
                            }
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                Friends
                                {pendingCount > 0 && (
                                    <span
                                        className="
                                            inline-flex items-center justify-center
                                            min-w-[1.25rem] h-5 px-1
                                            text-[0.7rem] font-bold text-white
                                            rounded-full
                                            bg-gradient-to-br from-pink-500 to-red-500
                                            shadow-sm shadow-rose-200/60
                                        "
                                        title={`${pendingCount} pending request${pendingCount === 1 ? "" : "s"}`}
                                    >
                                        {pendingLabel}
                                    </span>
                                )}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("rooms")}
                            className={
                                "relative z-10 flex-1 px-3 py-2 rounded-full text-center transition " +
                                (activeTab === "rooms"
                                    ? "text-gray-900"
                                    : "text-gray-500 hover:text-gray-700")
                            }
                        >
                            Chatrooms
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === "friends" ? <FriendsTab /> : <ChatroomsTab />}
            </div>
        </aside>
    );
};

export default Sidebar;
