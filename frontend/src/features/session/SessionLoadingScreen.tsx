import React from "react";

const SessionLoadingScreen: React.FC = () => {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white relative overflow-hidden">

            {/* ambient gradient blobs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-red-500/20 rounded-full blur-3xl" />
            </div>

            {/* loader content */}
            <div className="relative flex flex-col items-center gap-6">

                {/* spinner */}
                <div className="relative">
                    <div className="h-14 w-14 rounded-full border-4 border-white/10" />
                    <div className="absolute inset-0 h-14 w-14 rounded-full border-4 border-transparent border-t-pink-500 border-r-rose-500 animate-spin" />
                </div>

                {/* text */}
                <div className="text-center space-y-1">
                    <p className="text-lg font-semibold tracking-wide">
                        Preparing your session
                    </p>
                    <p className="text-sm text-slate-400">
                        If you can read this, I have failed you
                    </p>
                </div>

            </div>
        </div>
    );
};

export default SessionLoadingScreen;