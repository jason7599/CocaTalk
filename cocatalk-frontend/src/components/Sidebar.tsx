import type React from "react";
import {
    ArrowRightStartOnRectangleIcon,
    PlusIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import ChatroomList from "./ChatroomList";
import LogoutModal from "./LogoutModal";
import { useModal } from "../context/ModalContext";
import { useUser } from "../context/UserContext";
import { useState } from "react";
import FriendList from "./FriendList";

const Sidebar: React.FC = () => {
    const { showModal } = useModal();
    const { user } = useUser();

    const [activeTab, setActiveTab] = useState<"friends" | "rooms">("rooms");

    const handlePlusClick = () => {
        if (activeTab === "friends") {
            
        } else {

        }
    };

    return (
        <aside className="w-1/4 border-r bg-white flex flex-col relative">
            {/* TOP BAR */}
            <div className="flex h-24 items-center justify-between p-4 border-b">
                <div className="relative">
                    <UserCircleIcon className="w-10 h-10 text-red-600" />
                    <div>
                        <p className="font-semibold">{user?.username}</p>
                    </div>
                </div>
                

                <div className="px-4 w-full">
                    <div className="flex rounded-full bg-gray-100 p-1 text-sm font-medium">
                        <button
                            type="button"
                            onClick={() => setActiveTab("friends")}
                            className={
                                "flex-1 px-3 py-1 rounded-full text-center transition " +
                                (activeTab === "friends"
                                    ? "bg-white shadow text-gray-900"
                                    : "text-gray-500 hover:text-gray-700")
                            }
                        >
                            Friends
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("rooms")}
                            className={
                                "flex-1 px-3 py-1 rounded-full text-center transition " +
                                (activeTab === "rooms"
                                    ? "bg-white shadow text-gray-900"
                                    : "text-gray-500 hover:text-gray-700")
                            }
                        >
                            Chatrooms
                        </button>
                    </div>
                </div>


                <div className="flex gap-2">
                    <button
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                        title="Log out"
                        onClick={() => showModal(<LogoutModal/>)}
                    >
                        <ArrowRightStartOnRectangleIcon className="w-6 h-6 text-red-600" />
                    </button>
                </div>
            </div>
            
            <button
                onClick={handlePlusClick}
                className="ml-3 p-2 rounded-full border-2 border-green-300 bg-green-100 hover:bg-green-200 transition mt-4"
            >
                <PlusIcon className="w-full h-5 text-green-600" />
                {activeTab === "friends"
                    ? "Add Friend"
                    : "Create Group Chat"}
            </button>

            <div className="flex-1 overflow-y-auto mt-2">
                {activeTab === "friends" ? <FriendList /> : <ChatroomList />}
            </div>
        </aside>
    );
};

export default Sidebar;
