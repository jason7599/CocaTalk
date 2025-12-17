import React, { createContext, useState, useContext, type ReactNode, useEffect } from "react";

type ModalContextType = {
    showModal: (content: ReactNode) => void;
    closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);

    const showModal = (content: ReactNode) => setModalContent(content);
    const closeModal = () => setModalContent(null);

    useEffect(() => {
        if (!modalContent) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                closeModal();
            }    
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [modalContent]);

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            {children}

            {modalContent && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 relative">
                        {modalContent}
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used inside a ModalProvider");
    return ctx;
};
