import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { UserPlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useModal } from "../../shared/ModalContext";
import { searchUsers } from "./contactsApi";
import type { UserInfo } from "../../shared/types";
import { useContactsStore } from "./contactsStore";
import { useBlockedUsersStore } from "../userblock/blockedUsersStore";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 400;

const UserEntry: React.FC<{ user: UserInfo }> = ({ user }) => {

    const isContact = useContactsStore((s) => !!s.contacts[user.userId]);
    const isAdding = useContactsStore((s) => s.addingIds.has(user.userId));
    const addContact = useContactsStore((s) => s.addContact);
    const isBlocked = useBlockedUsersStore((s) => !!s.blockedUsers[user.userId]);

    const disabled = isContact || isBlocked || isAdding;

    return (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 transition ${disabled ? "opacity-60" : "hover:bg-white/5"}`}>
            <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-500/20 to-red-500/20 ring-1 ring-white/10" />
                <div className="truncate font-semibold">
                    <span>{user.username}</span>
                </div>
            </div>

            {isContact ? (
                <span className="text-xs font-semibold text-slate-400">
                    Added
                </span>
            ) : isBlocked ? (
                <span className="text-xs font-semibold text-slate-500">
                    Blocked
                </span>
            ) : (
                <button
                    disabled={isAdding}
                    onClick={() => addContact(user.userId)}
                    className="
                        rounded-xl px-3 py-1.5 text-xs font-semibold
                        text-white
                        bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                        shadow-sm shadow-rose-500/25
                        hover:brightness-110 transition
                        disabled:opacity-70 disabled:cursor-not-allowed
                    "
                >
                    {isAdding ? "Adding..." : "Add"}
                </button>
            )}
        </div>
    );
};

const AddContactModal: React.FC = () => {
    const { closeModal } = useModal();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmed = query.trim();
    const canSearch = trimmed.length >= MIN_QUERY_LENGTH;

    const helperText = useMemo(() => {
        if (!trimmed) return "Search by username.";
        if (!canSearch) return `Type at least ${MIN_QUERY_LENGTH} characters.`;
        if (loading) return "Searching...";
        if (results.length === 0) return "No results found";
        return "Click a user to add them.";
    }, [trimmed, canSearch, loading, results.length]);

    // Debounced Search
    useEffect(() => {
        if (!canSearch) {
            setResults([]);
            return;
        }

        setLoading(true);

        const handle = setTimeout(async () => {
            setError(null);

            try {
                const users = await searchUsers(trimmed);
                setResults(users);
            } catch {
                setError("Failed to search users");
            } finally {
                setLoading(false);
            }
        }, DEBOUNCE_MS);

        return () => clearTimeout(handle);
    }, [trimmed, canSearch]);

    return (
        <div className="w-[520px] max-w-[92vw]">
            <div className="rounded-3xl p-[1px] bg-gradient-to-br from-pink-500/60 via-rose-500/40 to-red-500/60 shadow-2xl shadow-rose-500/10">
                <div className="rounded-3xl border border-white/10 bg-[#0f0f18]/85 backdrop-blur-2xl text-slate-100 overflow-hidden">

                    {/* Header */}
                    <div className="p-6 border-b border-white/10 relative">
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
                                        Add contact
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {helperText}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={closeModal}
                                className="
                                    rounded-xl p-2
                                    text-slate-300 hover:text-slate-100
                                    hover:bg-white/5 transition
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/25
                                "
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3">
                        {/* Search input */}
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search username"
                                autoFocus
                                className="
                                    w-full rounded-2xl pl-12 pr-4 py-3
                                    border border-white/10 bg-white/5
                                    text-slate-100 placeholder:text-slate-500
                                    outline-none transition
                                    focus:border-rose-400/70 focus:ring-2 focus:ring-rose-300/25
                                "
                            />
                        </div>

                        {error && (
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        {/* Results */}
                        <div className="max-h-[320px] overflow-y-auto divide-y divide-white/10">
                            {results.map(u => (
                                <UserEntry key={u.userId} user={u} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default AddContactModal;
