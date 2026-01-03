import type React from "react";
import { useMemo, useState } from "react";
import {
    UserPlusIcon,
    BellIcon,
    ChatBubbleLeftIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import { useModal } from "../context/ModalContext";
import { usePendingRequestsStore } from "../store/pendingRequestsStore";
import { useFriendsStore } from "../store/friendsStore";
import FriendRequestModal from "./modals/FriendRequestModal";
import PendingRequestsModal from "./modals/PendingRequestsModal";
import RemoveFriendModal from "./modals/RemoveFriendModal";
import { useChatroomsStore } from "../store/chatroomsStore";
import { useActiveRoomStore } from "../store/activeRoomStore";

const FriendsTab: React.FC = () => {
    const friends = useFriendsStore((s) => s.friends);
    const openDirectChatroom = useChatroomsStore((s) => s.openDirectChatroom);
    const { showModal } = useModal();
    const pendingRequestCount = usePendingRequestsStore((s) => s.requests.length);
    const setActiveRoom = useActiveRoomStore((s) => s.setActiveRoom);

    const pendingLabel = useMemo(() => {
        if (pendingRequestCount <= 0) return "Requests";
        if (pendingRequestCount === 1) return "1 request";
        return `${pendingRequestCount} requests`;
    }, [pendingRequestCount]);

    const handleOpenFriendRequest = () => showModal(<FriendRequestModal />);
    const handleOpenPendingRequests = () => showModal(<PendingRequestsModal />);

    const handleRemove = (friendId: number, friendName: string) => {
        showModal(<RemoveFriendModal friendId={friendId} friendName={friendName} />);
    };

    const handleDM = async (friendId: number) => {
        const room = await openDirectChatroom(friendId);
        setActiveRoom(room ? room.id : null);
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Top Controls */}
            <div className="rounded-2xl border bg-white/70 backdrop-blur px-3 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                    {/* Primary CTA */}
                    <button
                        onClick={handleOpenFriendRequest}
                        className="
                            flex w-full items-center justify-center gap-2
                            rounded-xl px-4 py-3 text-sm font-semibold text-white
                            bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                            shadow-md shadow-rose-200/60
                            hover:shadow-lg hover:shadow-rose-300/60
                            hover:-translate-y-[1px] active:translate-y-0
                            transition
                            focus:outline-none focus:ring-2 focus:ring-rose-300
                        "
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Add Friend
                    </button>

                    {/* Pending Requests */}
                    <button
                        onClick={handleOpenPendingRequests}
                        className="
                            relative flex items-center gap-2
                            rounded-xl px-4 py-3 text-sm font-semibold
                            text-gray-700 bg-gray-100/80
                            hover:bg-gray-200/80 hover:-translate-y-[1px]
                            transition
                            focus:outline-none focus:ring-2 focus:ring-rose-200
                        "
                        aria-label={pendingLabel}
                        title={pendingLabel}
                    >
                        <BellIcon className="h-5 w-5 text-gray-700" />
                        <span className="hidden sm:inline">Requests</span>

                        {pendingRequestCount > 0 && (
                            <span
                                className="
                                ml-1 inline-flex items-center justify-center
                                min-w-[1.35rem] h-5 px-1
                                text-[0.7rem] font-bold text-white
                                rounded-full
                                bg-gradient-to-br from-pink-500 to-red-500
                                shadow-sm shadow-rose-200/60
                                "
                            >
                                {pendingRequestCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Friend List Container */}
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                {friends.length === 0 ? (
                    <div className="px-5 py-6">
                        <p className="text-sm text-gray-600">
                            Haha friendless bastard
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {friends.map((friend) => {
                            return (
                                <div
                                    key={friend.id}
                                    className="
                                        group flex items-center justify-between gap-3
                                        px-5 py-4
                                        hover:bg-rose-50/50
                                        transition
                                    "
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            {/* Optional: avatar placeholder */}
                                            <div
                                                className="
                                                    h-9 w-9 flex-none rounded-full
                                                    bg-gradient-to-br from-pink-200 to-rose-200
                                                    ring-1 ring-rose-200
                                                "
                                                aria-hidden="true"
                                            />
                                            <div className="px-2 min-w-0">
                                                <div className="truncate font-semibold text-gray-900">
                                                    {friend.username}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2">
                                        {/* DM button */}
                                        <button
                                            onClick={() => handleDM(friend.id)}
                                            className="
                                                inline-flex items-center gap-1.5
                                                rounded-xl px-3 py-2 text-xs font-semibold
                                                text-white
                                                bg-gradient-to-br from-pink-500 to-red-500
                                                shadow-sm shadow-rose-200/60
                                                hover:shadow-md hover:-translate-y-[1px]
                                                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                                transition
                                                focus:outline-none focus:ring-2 focus:ring-rose-300
                                            "
                                        >
                                            <ChatBubbleLeftIcon className="h-4 w-4" />
                                            <span>DM</span>
                                        </button>

                                        {/* Remove button */}
                                        <button
                                            onClick={() => handleRemove(friend.id, friend.username)}
                                            className="
                                                inline-flex items-center gap-1.5
                                                rounded-xl px-3 py-2 text-xs font-semibold
                                                text-rose-700
                                                bg-rose-50
                                                ring-1 ring-rose-200
                                                hover:bg-rose-100 hover:-translate-y-[1px]
                                                transition
                                                focus:outline-none focus:ring-2 focus:ring-rose-200
                                            "
                                            title="Remove friend"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                            <span className="hidden sm:inline">Remove</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsTab;
