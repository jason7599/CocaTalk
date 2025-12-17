import type React from "react";
import { UserPlusIcon, BellIcon, ChatBubbleLeftIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useModal } from "../context/ModalContext";
import { usePendingRequestsStore } from "../store/pendingRequestsStore";
import { useFriendsStore } from "../store/friendsStore";
import FriendRequestModal from "./modals/FriendRequestModal";
import PendingRequestsModal from "./modals/PendingRequestsModal";
import RemoveFriendModal from "./modals/RemoveFriendModal";
import { useChatroomsStore } from "../store/chatroomsStore";

const FriendList: React.FC = () => {
    const friends = useFriendsStore((s) => s.friends);
    const openDirectChatroom = useChatroomsStore((s) => s.openDirectChatroom);
    const { showModal } = useModal();
    const pendingRequestCount = usePendingRequestsStore((s) => s.requests.length);

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

                    {pendingRequestCount > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] px-1 h-5 text-[0.7rem] rounded-full bg-red-500 text-white font-semibold">
                            {pendingRequestCount}
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
                        <div
                            key={friend.id}
                            className="flex items-center justify-between px-4 py-3 text-sm"
                        >
                            <span className="font-medium text-gray-900">
                                {friend.username}
                            </span>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2">
                                {/* DM button */}
                                <button
                                    onClick={() => {
                                        openDirectChatroom(friend.id);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition"
                                >
                                    <ChatBubbleLeftIcon className="w-4 h-4" />
                                    <span>DM</span>
                                </button>

                                {/* Remove button */}
                                <button
                                    onClick={() => {
                                        showModal(<RemoveFriendModal friendId={friend.id} friendName={friend.username} />)
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                    <span>Remove</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FriendList;
