import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useFriendsStore } from "../../store/friendsStore";
import { UserPlusIcon } from "@heroicons/react/24/solid";

const FriendRequestModal: React.FC = () => {
    const { closeModal } = useModal();

    const [username, setUsername] = useState("");

    const sendFriendRequest = useFriendsStore((s) => s.sendFriendRequest);
    const friendRequestState = useFriendsStore((s) => s.friendRequestState);
    const resetFriendRequestState = useFriendsStore((s) => s.resetFriendRequestState);

    const trimmed = username.trim();
    const canSubmit = !friendRequestState.submitting && trimmed.length > 0;

    const successText = useMemo(() => {
        if (!friendRequestState.success) return null;
        return friendRequestState.success.type === "SENT"
            ? "Request sent"
            : `You are now friends with ${friendRequestState.success.friendInfo.username}`;
    }, [friendRequestState.success]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        sendFriendRequest(trimmed);
    };

    useEffect(() => {
        resetFriendRequestState();
        return () => resetFriendRequestState();
    }, [resetFriendRequestState]);

    return (
        <div className="w-[420px] max-w-[92vw]">
            {/* Gradient border wrapper */}
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-pink-500/60 via-rose-500/40 to-red-500/60 shadow-2xl shadow-rose-500/10">
                <div className="rounded-3xl border border-white/10 bg-[#0f0f18]/80 backdrop-blur-2xl text-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 relative">
                        {/* subtle ambient wash */}
                        <div className="pointer-events-none absolute inset-0 opacity-70">
                            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                            <div className="absolute -bottom-14 -right-14 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
                        </div>

                        <div className="relative flex items-start gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <UserPlusIcon className="h-5 w-5 text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold tracking-tight">
                                    Add Friend
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Enter a username to send a friend request.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <form onSubmit={onSubmit} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="friend-username"
                                className="block text-xs font-medium tracking-wide text-slate-400"
                            >
                                Username
                            </label>

                            <input
                                id="friend-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="username"
                                autoFocus
                                disabled={friendRequestState.submitting}
                                className="
                                    w-full rounded-2xl px-4 py-3
                                    border border-white/10 bg-white/5
                                    text-slate-100 placeholder:text-slate-500
                                    outline-none transition
                                    focus:border-rose-400/70 focus:ring-2 focus:ring-rose-300/25
                                    disabled:opacity-60
                                "
                            />

                            {/* Messages (no green) */}
                            {friendRequestState.error && (
                                <div
                                    className="
                                        rounded-2xl border border-red-500/30 bg-red-500/10
                                        px-4 py-3 text-sm text-red-200
                                    "
                                >
                                    {friendRequestState.error}
                                </div>
                            )}

                            {successText && (
                                <div
                                    className="
                                        rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10
                                        px-4 py-3 text-sm text-fuchsia-100
                                        shadow-[0_0_30px_rgba(217,70,239,0.10)]
                                    "
                                >
                                    {successText}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    resetFriendRequestState();
                                    closeModal();
                                }}
                                disabled={friendRequestState.submitting}
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
                                type="submit"
                                disabled={!canSubmit}
                                className="
                                    rounded-xl px-4 py-2 text-sm font-semibold text-white
                                    bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                                    shadow-lg shadow-rose-500/20
                                    hover:brightness-110 hover:-translate-y-[1px]
                                    active:translate-y-0
                                    transition
                                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/35
                                "
                            >
                                {friendRequestState.submitting ? "Sending…" : "Send Request"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FriendRequestModal;
