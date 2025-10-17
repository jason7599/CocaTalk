import type React from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";

const MainLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <ChatWindow />
        </div>
    );
}

export default MainLayout;