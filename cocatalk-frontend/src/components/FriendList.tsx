import type React from "react";
import { UserPlusIcon, BellIcon } from "@heroicons/react/24/solid";
import { useModal } from "../context/ModalContext";
import FriendRequestModal from "./FriendRequestModal";
import PendingRequestsModal from "./PendingRequestsModal";
import { usePendingRequests } from "../context/PendingRequestsContext";


const FriendList: React.FC = () => {
    const friends = [
    ];

    const { showModal } = useModal();
    const { pendingCount } = usePendingRequests();

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Top Controls */}
            <div className="flex items-center gap-3">
                
                {/* Primary CTA */}
                <button 
                    onClick={() => showModal(<FriendRequestModal />)}
                    className="flex w-full items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-lg text-sm font-medium transition-all shadow-sm">
                    <UserPlusIcon className="w-5 h-5" />
                    Add Friend
                </button>

                {/* Pending Requests */}
                <button
                    onClick={() => showModal(<PendingRequestsModal />)}
                    className="flex items-center gap-3 text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-3 rounded-lg text-sm font-medium transition"
                >
                    <BellIcon className="w-5 h-5" />
                    Requests

                    {pendingCount > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] px-1 h-5 text-[0.7rem] rounded-full bg-red-500 text-white font-semibold">
                            {pendingCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Friend List Container */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {friends.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500 italic">
                        Haha friendless bastard
                    </p>
                ) : (
                    friends.map((friend) => (
                        <button
                            key={friend.id}
                            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 transition"
                        >
                            <span className="font-medium text-gray-900">
                                {friend.username}
                            </span>

                            {/* Status */}
                            <span
                                className={
                                    "text-xs font-medium capitalize " +
                                    (friend.status === "online"
                                        ? "text-green-600"
                                        : friend.status === "busy"
                                        ? "text-yellow-600"
                                        : "text-gray-400")
                                }
                            >
                                {friend.status}
                            </span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default FriendList;
