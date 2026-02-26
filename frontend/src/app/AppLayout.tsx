import type React from "react";
import { ModalProvider } from "../shared/ModalContext";
import { StompProvider } from "../services/ws/stompContext";
import Sidebar from "./Sidebar";
import { useBootstrap } from "./useBootstrap";

const AppLayout: React.FC = () => {

    const { isLoading } = useBootstrap();

    if (isLoading) return <div>isLoading...</div>

    return (
        <StompProvider>
        <ModalProvider>

            <div className="h-screen flex">
                <Sidebar />
                {/* <ChatWindow /> */}
            </div>

        </ModalProvider>
        </StompProvider>
    );
}

export default AppLayout;