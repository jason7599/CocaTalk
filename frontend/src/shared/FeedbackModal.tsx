import type React from "react";
import { useModal } from "./ModalContext";

interface FeedbackModalProps {
    title: string;
    message: string;
    variant?: "SUCCESS" | "ERROR" | "WARNING";
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({
    title,
    message,
    variant = "SUCCESS"
}) => {
    const { closeModal } = useModal();

    const color =
        variant === "SUCCESS"
            ? "from-green-500 to-emerald-500"
            : variant === "ERROR"
                ? "from-red-500 to-rose-500"
                : "from-yellow-500 to-orange-500"
    ;

    return (
        <div className="w-[420px] max-w-[92vw]">
            <div className={`rounded-2xl p-[1px] bg-gradient-to-br ${color}`}>
                <div className="rounded-2xl bg-[#0f0f18] p-6 text-slate-100">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="mt-2 text-sm text-slate-300">{message}</p>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;