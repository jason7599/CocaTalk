import type React from "react";
import { useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useFriendsStore } from "../../store/friendsStore";

const FriendRequestModal: React.FC = () => {
    const { closeModal } = useModal();

    const [username, setUsername] = useState("");

    const friendRequestSubmitting = useFriendsStore((s) => s.friendRequestSubmitting);
    const friendRequestError = useFriendsStore((s) => s.friendRequestError);
    const friendRequestSuccess = useFriendsStore((s) => s.friendRequestSuccess);
    const sendFriendRequest = useFriendsStore((s) => s.sendFriendRequest);

    return (
        <div className="w-100 bg-white rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Add Friend</h2>
            <p className="text-s text-gray-500 mb-4">
                Enter your friend&apos;s username to send a request.
            </p>

            <form onSubmit={(e) => {
                    e.preventDefault();
                    sendFriendRequest(username);
                }}
                className="flex flex-col gap-3">
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
                    {friendRequestError && (
                        <p className="mt-1 text-sm text-red-500">
                            {friendRequestError}
                        </p>
                    )}
                    {friendRequestSuccess && (
                        <p className={"mt-1 text-sm text-green-600"}>
                            {friendRequestSuccess.type == "SENT"
                                ? "Successfully sent!"
                                : `You are now friends with ${friendRequestSuccess.friendInfo.username}`
                            }
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-3 py-2 text-sm rounded hover:bg-gray-100"
                        disabled={friendRequestSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={friendRequestSubmitting}
                    >
                        {friendRequestSubmitting ? "Sending..." : "Send Request"}
                    </button>
                </div>
            </form>
        </div>
    )
};

export default FriendRequestModal;