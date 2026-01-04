import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useFriendsStore } from "../../store/friendsStore";
import {
    UserPlusIcon,
    PaperAirplaneIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";

type OutgoingRequestUI = {
    id: number;
    username: string;
    sentAtLabel: string; // UI placeholder for now
};

const FriendRequestModal: React.FC = () => {
    const { closeModal } = useModal();

    const [activeTab, setActiveTab] = useState<"send" | "sent">("send");
    const [username, setUsername] = useState("");

    const sendFriendRequest = useFriendsStore((s) => s.sendFriendRequest);
    const friendRequestState = useFriendsStore((s) => s.friendRequestState);
    const resetFriendRequestState = useFriendsStore((s) => s.resetFriendRequestState);

    // UI placeholders for "Sent" tab (replace later with store selectors)
    const outgoingLoading = false;
    const outgoingError: string | null = null;
    const outgoingRequests: OutgoingRequestUI[] = [
        // Example placeholders — delete once real data wired
        { id: 101, username: "alice", sentAtLabel: "Sent 2m ago" },
        { id: 102, username: "bob", sentAtLabel: "Sent today" },
    ];

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
        <div className="w-[520px] max-w-[92vw]">
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

                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <UserPlusIcon className="h-5 w-5 text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]" />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold tracking-tight">
                                        Friend requests
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Send a request or manage the ones you’ve sent.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    resetFriendRequestState();
                                    closeModal();
                                }}
                                className="
                                    rounded-xl p-2
                                    text-slate-300 hover:text-slate-100
                                    hover:bg-white/5 transition
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/25
                                "
                                aria-label="Close"
                                title="Close"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="relative mt-5">
                            <div className="relative flex rounded-full bg-white/5 p-1 text-sm font-semibold overflow-hidden border border-white/10">
                                <div
                                    className={[
                                        "absolute top-1 bottom-1 left-1 rounded-full",
                                        "w-[calc(50%-0.25rem)] transition-transform duration-300 ease-out",
                                        "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500",
                                        "shadow-lg shadow-rose-500/25",
                                        activeTab === "send" ? "translate-x-0" : "translate-x-[calc(100%)]",
                                    ].join(" ")}
                                    aria-hidden="true"
                                />

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("send")}
                                    className={[
                                        "relative z-10 flex-1 px-3 py-2 rounded-full text-center transition",
                                        activeTab === "send" ? "text-white" : "text-slate-300 hover:text-slate-100",
                                    ].join(" ")}
                                >
                                    Send
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("sent")}
                                    className={[
                                        "relative z-10 flex-1 px-3 py-2 rounded-full text-center transition",
                                        activeTab === "sent" ? "text-white" : "text-slate-300 hover:text-slate-100",
                                    ].join(" ")}
                                >
                                    Sent
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {activeTab === "send" ? (
                            <form onSubmit={onSubmit} className="space-y-4">
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
                                        autoComplete="off"
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
                                        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                            {friendRequestState.error}
                                        </div>
                                    )}

                                    {successText && (
                                        <div className="rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-100 shadow-[0_0_30px_rgba(217,70,239,0.10)]">
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
                        ) : (
                            <div className="space-y-3">
                                {/* Sent tab header row */}
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-slate-100">
                                        Requests you sent
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {/* later: show count from real data */}
                                        {outgoingRequests.length} total
                                    </div>
                                </div>

                                {/* States */}
                                {outgoingLoading && (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                                        Loading…
                                    </div>
                                )}

                                {outgoingError && !outgoingLoading && (
                                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                        {outgoingError}
                                    </div>
                                )}

                                {!outgoingLoading && !outgoingError && outgoingRequests.length === 0 && (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                                        No outgoing requests right now.
                                    </div>
                                )}

                                {!outgoingLoading && !outgoingError && outgoingRequests.length > 0 && (
                                    <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
                                        {outgoingRequests.map((req) => (
                                            <div
                                                key={req.id}
                                                className="
                                                    group flex items-center justify-between gap-3
                                                    rounded-2xl border border-white/10
                                                    bg-white/5 backdrop-blur
                                                    px-4 py-3
                                                    hover:bg-white/8 transition
                                                "
                                            >
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold text-slate-100">
                                                        {req.username}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {req.sentAtLabel}
                                                    </div>
                                                </div>

                                                {/* UI-only cancel button */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // TODO: wire cancel logic later
                                                        // cancelOutgoingRequest(req.id)
                                                    }}
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
                                                    title="Cancel request"
                                                >
                                                    <PaperAirplaneIcon className="h-4 w-4 rotate-180" />
                                                    <span>Cancel</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Footer actions (optional) */}
                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="
                                            rounded-xl px-4 py-2 text-sm font-semibold
                                            text-slate-200 bg-white/5 border border-white/10
                                            hover:bg-white/10 transition
                                            focus:outline-none focus:ring-2 focus:ring-rose-300/25
                                        "
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendRequestModal;
