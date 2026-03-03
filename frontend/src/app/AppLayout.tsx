import type React from "react";
import { ModalProvider } from "../shared/ModalContext";
import { StompProvider } from "../services/ws/stompContext";
import Sidebar from "./Sidebar";
import ChatWindow from "../features/chat/ChatWindow";

const AppLayout: React.FC = () => {
    
    return (
        <StompProvider>
        <ModalProvider>

            <div className="h-screen flex">
                <Sidebar />
                <ChatWindow />
            </div>

        </ModalProvider>
        </StompProvider>
    );
}

export default AppLayout;