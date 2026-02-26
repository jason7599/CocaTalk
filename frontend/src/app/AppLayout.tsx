import type React from "react";
import { ModalProvider } from "../shared/ModalContext";
import { StompProvider } from "../services/ws/stompContext";

const AppLayout: React.FC = () => {

    console.log("ass");

    return (
        <StompProvider>
        <ModalProvider>

            <div className="h-screen flex">
                hi
                {/* <Sidebar /> */}
                {/* <ChatWindow /> */}
            </div>

        </ModalProvider>
        </StompProvider>
    );
}

export default AppLayout;