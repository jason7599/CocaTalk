import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Client, type StompSubscription } from "@stomp/stompjs";
import { wsHandleEvent, wsHandleMessage } from "./wsEventHandler";
import { useAuthStore } from "../../features/auth/authStore";

const WS_URL = import.meta.env.VITE_WS_URL;

type StompContextValue = {
    client: Client | null;
    connected: boolean;
};

const StompContext = createContext<StompContextValue>({
    client: null,
    connected: false,
});

export const StompProvider: React.FC<{ children: React.ReactNode }> = ({ children, }) => {
    const user = useAuthStore((s) => s.user);

    const [connected, setConnected] = useState(false);

    const clientRef = useRef<Client | null>(null);

    const messageSubRef = useRef<StompSubscription | null>(null);
    const eventSubRef = useRef<StompSubscription | null>(null);

    const cleanup = () => {
        messageSubRef.current?.unsubscribe();
        eventSubRef.current?.unsubscribe();

        messageSubRef.current = null;
        eventSubRef.current = null;

        setConnected(false);
    };

    useEffect(() => {
        if (!user) {
            clientRef.current?.deactivate();
            cleanup();
            return;
        }

        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 3000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            // TODO: remove on prod
            debug: (str) => console.log("[STOMP]", str),

            beforeConnect: async () => {
                client.connectHeaders = {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                };
            },

            onConnect: () => {
                // defensive 
                messageSubRef.current?.unsubscribe();
                eventSubRef.current?.unsubscribe();
                
                messageSubRef.current = client.subscribe(
                    "/user/queue/messages",
                    wsHandleMessage
                );
                
                eventSubRef.current = client.subscribe(
                    "/user/queue/events",
                    wsHandleEvent
                );
                
                setConnected(true);
            },

            onDisconnect: cleanup,
            onWebSocketClose: cleanup,
            onWebSocketError: cleanup,
            onStompError: cleanup,
        });

        clientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
            cleanup();
        };
    }, [user]);

    return (
        <StompContext.Provider value={{ client: clientRef.current, connected }}>
            {children}
        </StompContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStomp = () => useContext(StompContext);