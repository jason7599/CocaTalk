import type React from "react";
import { useBlockedUsersStore } from "./blockedUsersStore";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const BlockedUsersPanel: React.FC = () => {
    const blockedUsers = useBlockedUsersStore((s) => s.blockedUsers);
    const blockedUsersList = Object.values(blockedUsers).sort((a, b) =>
        a.username.localeCompare(b.username, undefined, { sensitivity: "base" })
    );

    if (blockedUsersList.length === 0) {
        return (
            <div className="
                relative overflow-hidden
                rounded-3xl
                border border-white/10
                bg-white/[0.03]
                py-14
                flex flex-col items-center text-center
            ">
                {/* Ambient glow */}
                <div className="pointer-events-none absolute inset-0 opacity-70">
                    <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-pink-500/10 blur-3xl" />
                    <div className="absolute -bottom-14 -right-14 h-40 w-40 rounded-full bg-rose-500/10 blur-3xl" />
                </div>

                {/* Icon */}
                <div className="
                    relative mb-4
                    h-14 w-14 rounded-2xl
                    bg-gradient-to-br from-rose-500/15 to-pink-500/15
                    border border-rose-500/20
                    flex items-center justify-center
                    shadow-inner
                ">
                    <UserCircleIcon className="h-7 w-7 text-rose-300 opacity-80" />
                </div>

                <p className="relative text-sm font-semibold text-slate-200">
                    No blocked users
                </p>

                <p className="relative text-xs mt-2 text-slate-400 max-w-[240px]">
                    When you block someone, they'll appear here.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200 tracking-wide">
                    Blocked Users
                </h3>
                <span className="text-xs text-slate-400">
                    {blockedUsersList.length}
                </span>
            </div>

            {/* List */}
            <div className="space-y-3">
                {blockedUsersList.map((user) => (
                    <div
                        className="
                            group relative
                            flex items-center justify-between
                            px-4 py-3 rounded-2xl
                            bg-white/5 border border-white/10
                            hover:bg-white/10
                            transition-all duration-300
                        "
                    >
                        {/* Left Side */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="
                                h-9 w-9 rounded-xl
                                bg-rose-500/10 border border-rose-500/20
                                flex items-center justify-center
                                "
                            >
                                <UserCircleIcon className="h-5 w-5 text-rose-300" />
                            </div>

                            <span className="text-sm text-slate-200 truncate">
                                {user.username}
                            </span>
                        </div>

                        {/* Right Side */}
                        <button
                            className="
                                text-sm font-medium
                                text-rose-400
                                opacity-70
                                group-hover:opacity-100
                                hover:text-rose-300
                                transition
                            "
                        >
                            Unblock
                        </button>

                        {/* Subtle hover glow */}
                        <div className="
                            pointer-events-none absolute inset-0 rounded-2xl
                            opacity-0 group-hover:opacity-100
                            transition
                            bg-gradient-to-r from-rose-500/5 via-transparent to-pink-500/5
                        "/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlockedUsersPanel;