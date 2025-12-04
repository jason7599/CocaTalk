import type React from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { ModalProvider } from "./context/ModalContext";
import { UserProvider } from "./context/UserContext";

const MainLayout: React.FC = () => {
    return (
        <UserProvider>
        <ModalProvider>

            <div className="h-screen flex">
                <Sidebar />
                <ChatWindow />
            </div>

        </ModalProvider>
        </UserProvider>
    );
}

export default MainLayout;