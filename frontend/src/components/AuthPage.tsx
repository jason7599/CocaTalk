import React, { useState } from 'react';
import { login, register } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true); // toggle between login/register
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const navigate = useNavigate();

    const resetFields = () => {
        setUsername('');
        setPassword('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!username.trim() || !password.trim()) {
            setMessage("Username and password cannot be blank.");
            setIsError(true);
            return;
        }

        try {
            if (isLogin) {
                await login(username, password);
                setMessage('Login success!');
                setIsError(false);

                navigate('/chatrooms', { replace: true });
                window.location.reload();

            } else {
                await register(username, password);
                setMessage('Registration successful!');
                setIsError(false);

                setIsLogin(true);
                resetFields();
            }
        } catch (err: any) {
            setIsError(true);
            setMessage(err.message || 'Something went wrong.');
        }
    };

    return (
        <div className="min-h-svh bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-100 grid place-items-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {isLogin ? "Welcome back" : "Create account"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        {isLogin ? "Log in to continue" : "Sign up to get started"}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="username" className="block text-xs font-medium tracking-wide text-slate-400">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="username"                            
                            value={username}
                            maxLength={25}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/40"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="password" className="block text-xs font-medium tracking-wide text-slate-400">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/40"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-indigo-500 px-4 py-2.5 font-semibold text-white shadow-md shadow-indigo-900/40 transition hover:brightness-110 active:translate-y-px"
                    >
                        {isLogin ? "Login" : "Register"}
                    </button>
                </form>

                {/* Switch + message */}
                <div className="px-6 pb-6 space-y-3">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); resetFields(); }}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                    >
                        Switch to {isLogin ? "Register" : "Login"}
                    </button>

                    {message && (
                        <div
                            className={[
                                "rounded-xl border px-3 py-2 text-sm",
                                isError
                                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                            ].join(" ")}
                        >
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default AuthPage;
