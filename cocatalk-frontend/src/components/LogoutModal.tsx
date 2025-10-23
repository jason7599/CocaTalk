import React from "react";
import { useModal } from "../context/ModalContext";
import { useUser } from "../context/UserContext";

const LogoutModal: React.FC = () => {
    const { closeModal } = useModal();
    const { logout } = useUser();

    return (
        <>
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-2">
                <button
                    onClick={closeModal}
                    className="px-4 py-2 rounded-md border hover:bg-gray-100 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={logout}
                    className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                >
                    Log Out
                </button>
            </div>
        </>
    );
};

export default LogoutModal;
