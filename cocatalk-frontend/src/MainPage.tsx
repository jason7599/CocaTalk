import type React from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { ChatroomProvider } from "./context/ChatroomContext";
import { ModalProvider } from "./context/ModalContext";
import { UserProvider } from "./context/UserContext";
import { PendingRequestsProvider } from "./context/PendingRequestsContext";

const MainLayout: React.FC = () => {
    return (
        <UserProvider>
        <ChatroomProvider>
        <PendingRequestsProvider>
        <ModalProvider>

            <div className="h-screen flex">
                <Sidebar />
                <ChatWindow />
            </div>

        </ModalProvider>
        </PendingRequestsProvider>
        </ChatroomProvider>
        </UserProvider>
    );
}

export default MainLayout;