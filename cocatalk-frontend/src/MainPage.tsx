import type React from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { ChatroomProvider } from "./context/ChatroomContext";
import { ModalProvider } from "./context/ModalContext";
import { UserProvider } from "./context/UserContext";

const MainLayout: React.FC = () => {
    return (
        <UserProvider>
        <ChatroomProvider>
        <ModalProvider>
            <div className="h-screen flex">
                <Sidebar />
                <ChatWindow />
            </div>
        </ModalProvider>
        </ChatroomProvider>
        </UserProvider>
    );
}

export default MainLayout;