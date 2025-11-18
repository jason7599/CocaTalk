import type React from "react";

const FriendList: React.FC = () => {
    // TODO: replace this with actual friend data / API
    const friends = [
        { id: 1, username: "alice", status: "online" },
        { id: 2, username: "bob", status: "offline" },
        { id: 3, username: "charlie", status: "busy" },
    ];

    return (
        <div className="flex flex-col">
            {friends.length === 0 ? (
                <p className="px-4 py-2 text-sm text-gray-500">
                    Haha friendless bastard
                </p>
            ) : (
                friends.map((friend) => (
                    <button
                        key={friend.id}
                        className="w-full flex items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50 transition"
                    >
                        <span className="font-medium text-gray-800">
                            {friend.username}
                        </span>
                        <span
                            className={
                                "text-xs " +
                                (friend.status === "online"
                                    ? "text-green-600"
                                    : friend.status === "busy"
                                    ? "text-yellow-600"
                                    : "text-gray-400")
                            }
                        >
                            {friend.status}
                        </span>
                    </button>
                ))
            )}
        </div>
    );
};

export default FriendList;
