import React, { useMemo, useState } from "react";
import { login, register } from "../api/auth";
import { useNavigate } from "react-router-dom";
import {
    UserIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
} from "@heroicons/react/24/outline";

const AuthPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const navigate = useNavigate();

    const title = useMemo(
        () => (isLogin ? "Welcome back" : "Create account"),
        [isLogin]
    );
    const subtitle = useMemo(
        () => (isLogin ? "Log in to continue" : "Sign up to get started"),
        [isLogin]
    );

    const resetFields = () => {
        setUsername("");
        setPassword("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setIsError(false);

        const u = username.trim();
        const p = password.trim();

        if (!u || !p) {
            setMessage("Username and password cannot be blank.");
            setIsError(true);
            return;
        }

        try {
            setLoading(true);

            if (isLogin) {
                await login(u, p);
                setMessage("Login success!");
                setIsError(false);

                navigate("/chatrooms", { replace: true });
                window.location.reload();
            } else {
                await register(u, p);
                setMessage("Registration successful!");
                setIsError(false);

                setIsLogin(true);
                resetFields();
            }
        } catch (err: any) {
            setIsError(true);
            setMessage(err?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-svh grid place-items-center p-6 text-slate-100 relative overflow-hidden">
            {/* Background layers */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b14] via-[#0d0d18] to-[#120c18]" />

                {/* Subtle color wash */}
                <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_10%,rgba(236,72,153,0.12),transparent_60%),radial-gradient(60%_50%_at_80%_90%,rgba(239,68,68,0.12),transparent_60%)]" />

                {/* Very soft diagonal sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-40" />

                {/* Noise / grain */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"4\"/></filter><rect width=\"100\" height=\"100\" filter=\"url(%23n)\"/></svg>')",
                    }}
                />
            </div>

            {/* Background glow */}
            <div
                className="pointer-events-none absolute inset-0 opacity-70"
                aria-hidden="true"
            >
                <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
                <div className="absolute -bottom-44 -right-44 h-[28rem] w-[28rem] rounded-full bg-red-500/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Gradient border wrapper */}
                <div className="rounded-3xl p-[1px] bg-gradient-to-br from-pink-500/60 via-rose-500/40 to-red-500/60 shadow-2xl shadow-rose-500/10">
                    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        {title}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
                                </div>

                                {/* Login/Register toggle pill */}
                                <div className="rounded-full bg-white/5 p-1 border border-white/10">
                                    <div className="relative flex text-xs font-semibold">
                                        <div
                                            className={
                                                "absolute top-0 bottom-0 w-1/2 rounded-full bg-white/10 transition-transform " +
                                                (isLogin ? "translate-x-0" : "translate-x-full")
                                            }
                                            aria-hidden="true"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(true);
                                                setMessage("");
                                                setIsError(false);
                                            }}
                                            className={
                                                "relative z-10 px-3 py-1.5 rounded-full transition " +
                                                (isLogin ? "text-white" : "text-slate-400 hover:text-slate-200")
                                            }
                                        >
                                            Login
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(false);
                                                setMessage("");
                                                setIsError(false);
                                            }}
                                            className={
                                                "relative z-10 px-3 py-1.5 rounded-full transition " +
                                                (!isLogin ? "text-white" : "text-slate-400 hover:text-slate-200")
                                            }
                                        >
                                            Register
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Username */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="username"
                                    className="block text-xs font-medium tracking-wide text-slate-400"
                                >
                                    Username
                                </label>
                                <div className="relative">
                                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="yourname"
                                        value={username}
                                        maxLength={25}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={loading}
                                        className="
                                            w-full rounded-2xl pl-11 pr-3 py-3
                                            border border-white/10 bg-slate-900/50
                                            text-slate-100 placeholder:text-slate-500
                                            outline-none transition
                                            focus:border-rose-400/70 focus:ring-2 focus:ring-rose-300/30
                                            disabled:opacity-60
                                        "
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-medium tracking-wide text-slate-400"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="password"
                                        type={showPw ? "text" : "password"}
                                        placeholder="••••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        className="
                                            w-full rounded-2xl pl-11 pr-11 py-3
                                            border border-white/10 bg-slate-900/50
                                            text-slate-100 placeholder:text-slate-500
                                            outline-none transition
                                            focus:border-rose-400/70 focus:ring-2 focus:ring-rose-300/30
                                            disabled:opacity-60
                                        "
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw((v) => !v)}
                                        className="
                                            absolute right-2 top-1/2 -translate-y-1/2
                                            rounded-xl p-2
                                            text-slate-400 hover:text-slate-200 hover:bg-white/5
                                            transition
                                            focus:outline-none focus:ring-2 focus:ring-rose-300/30
                                        "
                                        title={showPw ? "Hide password" : "Show password"}
                                        aria-label={showPw ? "Hide password" : "Show password"}
                                    >
                                        {showPw ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Primary button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    w-full rounded-2xl px-4 py-3 font-semibold text-white
                                    bg-gradient-to-br from-pink-500 via-rose-500 to-red-500
                                    shadow-lg shadow-rose-500/20
                                    hover:brightness-110 hover:-translate-y-[1px]
                                    active:translate-y-0
                                    transition
                                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                    focus:outline-none focus:ring-2 focus:ring-rose-300/40
                                "
                            >
                                {loading ? (isLogin ? "Logging in…" : "Creating…") : isLogin ? "Login" : "Register"}
                            </button>
                        </form>

                        {/* Message */}
                        <div className="px-6 pb-6">
                            {message && (
                                <div
                                    className={[
                                        "rounded-2xl border px-4 py-3 text-sm",
                                        isError
                                            ? "border-red-500/40 bg-red-500/10 text-red-200"
                                            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                                    ].join(" ")}
                                >
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
