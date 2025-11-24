import type React from "react";
import { useModal } from "../context/ModalContext";
import { useState } from "react";
import { sendFriendRequest } from "../api/friendship";

type SubmitResult = 
    | { type: "error"; message: string }
    | { type: "success"; message: string}
    | null;

const FriendRequestModal: React.FC = () => {
    const { closeModal } = useModal();

    const [username, setUsername] = useState("");
    const [submitResult, setSubmitResult] = useState<SubmitResult>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            setSubmitResult({ type: "error", message: "Enter a username!" });
            return;
        }

        setSubmitResult(null);
        setIsSubmitting(true);

        try {
            await sendFriendRequest(username.trim());
            setSubmitResult({ type: "success", message: "Successfully sent!"});
        } catch (err: any) {
            setSubmitResult({ type: "error", message: err.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-100 bg-white rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Add Friend</h2>
            <p className="text-s text-gray-500 mb-4">
                Enter your friend&apos;s username to send a request.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                    <input
                        id="friend-username"
                        type="text"
                        value={username}
                        onChange={(e) => {setUsername(e.target.value)}}
                        className="w-full p-2 border rounded-lg text-sm focus:outline-one focus:ring-2 focus:ring-red-200"
                        placeholder="Username"
                        autoFocus
                    />
                    {submitResult && (
                        <p
                            className={`mt-1 text-sm ${
                               submitResult.type === "error" ? "text-red-500" : "text-green-600" 
                            }`}
                        >
                            {submitResult.message}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-3 py-2 text-sm rounded hover:bg-gray-100"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Sending..." : "Send Request"}
                    </button>
                </div>
            </form>
        </div>
    )
};

export default FriendRequestModal;