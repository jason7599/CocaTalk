import type React from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { ChatroomProvider } from "./context/ChatroomContext";
import { ModalProvider } from "./context/ModalContext";

const MainLayout: React.FC = () => {
    return (
        <ChatroomProvider>
        <ModalProvider>
            <div className="h-screen flex">
                <Sidebar />
                <ChatWindow />
            </div>
        </ModalProvider>
        </ChatroomProvider>
    );
}

export default MainLayout;