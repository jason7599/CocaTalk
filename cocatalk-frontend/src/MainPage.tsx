import type React from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { ModalProvider } from "./context/ModalContext";
import { UserProvider } from "./context/UserContext";
import { useEffect } from "react";
import { usePendingRequestsStore } from "./store/pendingRequestsStore";
import { useFriendsStore } from "./store/friendsStore";
import { useWsStore } from "./ws/wsStore";

const MainLayout: React.FC = () => {

    const connect = useWsStore((s) => s.connect);
    const disconnect = useWsStore((s) => s.disconnect);

    useEffect(() => {
        connect();

        usePendingRequestsStore.getState().fetch();
        useFriendsStore.getState().fetch();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

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