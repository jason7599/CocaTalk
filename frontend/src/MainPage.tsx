import type React from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { ModalProvider } from "./context/ModalContext";
import { UserProvider } from "./context/UserContext";
import { useEffect } from "react";
import { usePendingRequestsStore } from "./store/pendingRequestsStore";
import { useFriendsStore } from "./store/friendsStore";
import { useChatroomsStore } from "./store/chatroomsStore";
import { StompProvider } from "./ws/StompContext";

const MainPage: React.FC = () => {

    useEffect(() => {
        usePendingRequestsStore.getState().fetch();
        useFriendsStore.getState().fetch();
        useChatroomsStore.getState().fetch();
    }, []);

    return (
        <UserProvider>
        <StompProvider>
        <ModalProvider>

            <div className="h-screen flex">
                <Sidebar />
                <ChatWindow />
            </div>

        </ModalProvider>
        </StompProvider>
        </UserProvider>
    );
}

export default MainPage;