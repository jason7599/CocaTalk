import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useFriendsStore } from "../../store/friendsStore";
import { useModal } from "../../context/ModalContext";

type RemoveFriendModalProps = {
    friendId: number;
    friendName: string;
};

const RemoveFriendModal: React.FC<RemoveFriendModalProps> = ({
    friendId,
    friendName,
}) => {
    const { closeModal } = useModal();
    const removeFriend = useFriendsStore((s) => s.removeFriend);

    const handleConfirm = () => {
        removeFriend(friendId);
        closeModal();
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold">Remove Friend</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to remove{" "}
                        <span className="font-semibold text-gray-900">
                            {friendName}
                        </span>{" "}
                        from your friends list? This action can’t be undone.
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    className="px-4 py-2 rounded-md bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition shadow-sm"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};

export default RemoveFriendModal;
