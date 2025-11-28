import type React from "react";
import { useModal } from "../context/ModalContext";
import { usePendingRequests } from "../context/PendingRequestsContext";

const PendingRequestsModal: React.FC = () => {

    const { closeModal } = useModal();
    const { requests, loading, error, accept, decline } = usePendingRequests();

    return (
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                    Pending Friend Requests
                </h2>
                <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                >
                    ✕
                </button>
            </div>

            {/* Content */}
            {loading && (
                <p className="text-sm text-gray-500">Loading requests...</p>
            )}

            {error && !loading && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {!loading && !error && requests.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                    You have no pending requests.
                </p>
            )}

            {!loading && !error && requests.length > 0 && (
                <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto mt-2">
                    {requests.map((req) => (
                        <li
                            key={req.senderId}
                            className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
                        >
                            <span className="text-sm font-medium text-gray-900">
                                {req.senderName}
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => accept(req.senderId)}
                                    className="text-xs px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => decline(req.senderId)}
                                    className="text-xs px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                                >
                                    Decline
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingRequestsModal;