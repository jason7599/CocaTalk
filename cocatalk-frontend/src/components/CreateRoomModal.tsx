import { useState } from "react";
import { useModal } from "../context/ModalContext";
import { useChatroomsStore } from "../store/chatroomsStore";

const CreateRoomModal: React.FC = () => {
    const { closeModal } = useModal();

    const addChatroom = useChatroomsStore((s) => s.addChatroom);
    const loading = useChatroomsStore((s) => s.loading);
    const error = useChatroomsStore((s) => s.error);

    const [name, setName] = useState("");

    return (
        <>
            <h2 className="text-lg font-semibold mb-4">Create New Room</h2>
            <p className="text-sm text-gray-600 mb-4">
                Enter a name for the new chatroom (optional).
            </p>

            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Room name (optional)"
                className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring focus:ring-blue-300"
            />

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <div className="flex justify-end gap-2">
                <button
                    onClick={closeModal}
                    disabled={loading}
                    className="px-4 py-2 rounded-md border hover:bg-gray-100 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={() => { addChatroom(name.trim() || null) }}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                        } transition`}
                >
                    {loading ? "Creating..." : "Create"}
                </button>
            </div>
        </>
    );
};

export default CreateRoomModal;
