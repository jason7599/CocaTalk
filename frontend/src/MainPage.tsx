import type React from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { ModalProvider } from "./components/modals/ModalContext";
import { StompProvider } from "./ws/stompContext";

const MainPage: React.FC = () => {

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

export default MainPage;