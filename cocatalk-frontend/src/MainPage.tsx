import type React from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { ModalProvider } from "./context/ModalContext";
import { UserProvider } from "./context/UserContext";
import { useEffect } from "react";
import { usePendingRequestsStore } from "./store/pendingRequestsStore";
import { useFriendsStore } from "./store/friendsStore";
import { useWsStore } from "./ws/wsStore";
import { useChatroomsStore } from "./store/chatroomsStore";

const MainLayout: React.FC = () => {

    const connectWs = useWsStore((s) => s.connect);
    const disconnectWs = useWsStore((s) => s.disconnect);

    useEffect(() => {
        connectWs();

        usePendingRequestsStore.getState().fetch();
        useFriendsStore.getState().fetch();
        useChatroomsStore.getState().fetch();

        return () => {
            disconnectWs();
        };
    }, [connectWs, disconnectWs]);

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