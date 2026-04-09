import type React from "react";
import { ModalProvider } from "../shared/ModalContext";
import Sidebar from "./Sidebar";
import ChatWindow from "../features/chat/ChatWindow";

const AppLayout: React.FC = () => {
    return (
        <ModalProvider>
            <div className="h-screen flex">
                <Sidebar />
                <ChatWindow />
            </div>
        </ModalProvider>
    );
}

export default AppLayout;