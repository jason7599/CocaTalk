import type React from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { createContext, useContext, useState, type ReactNode } from "react";

type ModalContextType = {
    showModal: (modal: ReactNode) => void;
    closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used inside ModalProvider");
    return ctx;
}

const MainLayout: React.FC = () => {
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);

    const showModal = (content: ReactNode) => setModalContent(content);
    const closeModal = () => setModalContent(null);

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            <div className="h-screen flex">
                <Sidebar />
                <ChatWindow />
            </div>

            {/* Global Modal Layer */}
            {modalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 relative">
                        {modalContent}
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
}

export default MainLayout;