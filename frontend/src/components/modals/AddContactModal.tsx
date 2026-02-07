import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useContactsStore } from "../../store/contactsStore";
import { UserPlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

type ParseResult =
    | { ok: true; name: string; tag: string }
    | { ok: false; error: string };

const CROCKFORD_TAG_RE = /^[A-HJ-NP-Z2-9]+$/i;

function parseUsername(input: string): ParseResult {
    const s = input.trim();

    // Require exactly one '#'
    const hashCount = (s.match(/#/g) ?? []).length;
    if (hashCount !== 1) return { ok: false, error: `Username must be in the form "name#tag".` };

    const [name, tag] = s.split("#");

    if (!name || !tag) return { ok: false, error: `Username must be in the form "name#tag".` };

    if (!CROCKFORD_TAG_RE.test(tag)) {
        return { ok: false, error: `Tag must be composed of 2-9, A-Z without I, L, O.` };
    }

    return { ok: true, name, tag };
}

const AddContactModal: React.FC = () => {
    const { closeModal } = useModal();

    const addContact = useContactsStore((s) => s.addContact);
    const error = useContactsStore((s) => s.error);
    const clearError = useContactsStore((s) => s.clearError);

    const [localError, setLocalError] = useState<string | null>(null);

    const [username, setUsername] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [localSuccess, setLocalSuccess] = useState<string | null>(null);

    const trimmed = username.trim();
    const canSubmit = !submitting && trimmed.length > 0;

    const helperText = useMemo(() => {
        if (localSuccess) return localSuccess;
        return "Add someone to your contacts.";
    }, [localSuccess]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canSubmit) return;

        setLocalSuccess(null);
        
        const parsed = parseUsername(trimmed);
        if (!parsed.ok) {
            setLocalError(parsed.error);
            return;
        }

        setLocalError(null);
        clearError();

        setSubmitting(true);

        try {
            await addContact(parsed.name, parsed.tag);

            clearError();
            setLocalSuccess(`Added "${parsed.name}" to contacts.`);
            setUsername("");
        } catch {
            setLocalSuccess(null);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        clearError();
        return () => clearError();
    }, [clearError]);

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
                                    <p className="mt-1 text-sm text-slate-400">{helperText}</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
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
                    </div>

                    {/* Body */}
                    <form onSubmit={onSubmit} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="block text-xs font-medium tracking-wide text-slate-400">
                                Username
                            </label>

                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="username#tag"
                                autoFocus
                                className="
                                    w-full rounded-2xl px-4 py-3
                                    border border-white/10 bg-white/5
                                    text-slate-100 placeholder:text-slate-500
                                    outline-none transition
                                    focus:border-rose-400/70 focus:ring-2 focus:ring-rose-300/25
                                "
                            />

                            {/* Local validation error */}
                            {localError && (
                                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {localError}
                                </div>
                            )}

                            {/* Error from store (API/server) */}
                            {!localError && error && (
                                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {error}
                                </div>
                            )}

                            {/* Success (local) */}
                            {localSuccess && (
                                <div className="rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-100 shadow-[0_0_30px_rgba(217,70,239,0.10)]">
                                    {localSuccess}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={submitting}
                                className="
                                    rounded-xl px-4 py-2 text-sm font-semibold
                                    text-slate-200 bg-white/5 border border-white/10
                                    hover:bg-white/10 transition
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/20
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
                                    active:translate-y-0 transition
                                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/35
                                "
                            >
                                {submitting ? "Adding…" : "Add"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddContactModal;
