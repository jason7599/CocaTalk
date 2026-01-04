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
        <div className="flex flex-col gap-4 p-4 text-slate-100">
            {/* Top Controls */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm overflow-hidden relative">
                {/* subtle ambient wash */}
                <div className="pointer-events-none absolute inset-0 opacity-70">
                    <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                    <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
                </div>

                <div className="relative flex items-center gap-3 p-3">
                    {/* Primary CTA */}
                    <button
                        onClick={handleOpenFriendRequest}
                        className="
                            flex w-full items-center justify-center gap-2
                            rounded-xl px-4 py-3 text-sm font-semibold text-white
                            bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                            shadow-lg shadow-rose-500/25
                            hover:brightness-110 hover:-translate-y-[1px]
                            active:translate-y-0
                            transition
                            focus:outline-none focus:ring-2 focus:ring-rose-300/40
                        "
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Add Friend
                    </button>

                    {/* Pending Requests */}
                    <button
                        onClick={handleOpenPendingRequests}
                        className="
                            relative flex items-center justify-center gap-2
                            rounded-xl px-4 py-3 text-sm font-semibold
                            text-slate-200 bg-white/5
                            border border-white/10
                            hover:bg-white/10 hover:-translate-y-[1px]
                            transition
                            focus:outline-none focus:ring-2 focus:ring-rose-300/30
                        "
                        aria-label={pendingLabel}
                        title={pendingLabel}
                    >
                        <BellIcon className="h-5 w-5 text-slate-200" />
                        <span className="hidden sm:inline">Requests</span>

                        {pendingRequestCount > 0 && (
                            <span
                                className="
                                    ml-1 inline-flex items-center justify-center
                                    min-w-[1.35rem] h-5 px-1
                                    text-[0.7rem] font-bold text-white
                                    rounded-full
                                    bg-gradient-to-br from-pink-500 to-red-500
                                    shadow-sm shadow-rose-500/25
                                "
                            >
                                {pendingRequestCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Friend List Container */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-sm overflow-hidden">
                {friends.length === 0 ? (
                    <div className="px-5 py-6">
                        <p className="text-sm text-slate-300">
                            Haha friendless bastard 🥀🥀🥀
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {friends.map((friend) => {
                            return (
                                <div
                                    key={friend.id}
                                    className="
                                        group flex items-center justify-between gap-3
                                        px-5 py-4
                                        hover:bg-white/5
                                        transition
                                    "
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            {/* avatar placeholder with neon ring */}
                                            <div
                                                className="
                                                    h-9 w-9 flex-none rounded-full
                                                    bg-gradient-to-br from-pink-500/20 to-red-500/20
                                                    ring-1 ring-white/10
                                                    shadow-[0_0_18px_rgba(244,63,94,0.15)]
                                                "
                                                aria-hidden="true"
                                            />
                                            <div className="min-w-0">
                                                <div className="truncate font-semibold text-slate-100">
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
                                                bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                                                shadow-sm shadow-rose-500/25
                                                hover:brightness-110 hover:-translate-y-[1px]
                                                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                                transition
                                                focus:outline-none focus:ring-2 focus:ring-rose-300/40
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
                                                text-rose-200
                                                bg-rose-500/10
                                                border border-rose-500/20
                                                hover:bg-rose-500/15 hover:-translate-y-[1px]
                                                transition
                                                focus:outline-none focus:ring-2 focus:ring-rose-300/25
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
