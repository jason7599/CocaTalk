import type React from "react";
import {
    PlusIcon,
    ArrowRightStartOnRectangleIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";
import ChatroomList from "./ChatroomList";
import LogoutModal from "./LogoutModal";
import CreateRoomModal from "./CreateRoomModal";
import { useModal } from "../context/ModalContext";
import { useUser } from "../context/UserContext";

const Sidebar: React.FC = () => {
    const { showModal } = useModal();
    const { user } = useUser();

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

                <div className="flex gap-2">
                    <button
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                        title="Create Room"
                        onClick={() => showModal(<CreateRoomModal />)}
                    >
                        <PlusIcon className="w-6 h-6 text-green-600" />
                    </button>

                    <button
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                        title="Log out"
                        onClick={() => showModal(<LogoutModal/>)}
                    >
                        <ArrowRightStartOnRectangleIcon className="w-6 h-6 text-red-600" />
                    </button>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="p-4">
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full p-2 rounded-full border border-gray-300"
                />
            </div>

            <ChatroomList />
        </aside>
    );
};

export default Sidebar;
