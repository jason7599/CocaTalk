import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useChatroomsStore } from "../../features/chat/chatroomsStore";

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
    const [connected, setConnected] = useState(false);

    const clientRef = useRef<Client | null>(null);
    const notificationSubRef = useRef<StompSubscription | null>(null);
    const roomSubsRef = useRef<Map<number, StompSubscription>>(new Map());

    const rooms = useChatroomsStore((state) => state.chatrooms);


    const subscribeToRoom = (roomId: number) => {
        const client = clientRef.current;
        if (!client || !client.connected) return;
        if (roomSubsRef.current.has(roomId)) return;

        const sub = client.subscribe(
            `/topic/chatroom.${roomId}`,
            (frame: IMessage) => {
                console.log("room msg", roomId, frame.body);
            }
        );

        roomSubsRef.current.set(roomId, sub);
    };

    const unsubscribeFromRoom = (roomId: number) => {
        const sub = roomSubsRef.current.get(roomId);
        if (!sub) return;

        sub.unsubscribe();
        roomSubsRef.current.delete(roomId);
    };

    const clearAllRoomSubs = () => {
        roomSubsRef.current.forEach((sub) => sub.unsubscribe());
        roomSubsRef.current.clear();
    };

    useEffect(() => {
        const client = clientRef.current;
        if (!client || !client.connected) return;

        const currentIds = new Set(rooms.map((r) => r.roomId));

        // subscribe new
        currentIds.forEach((id) => {
            if (!roomSubsRef.current.has(id)) {
                subscribeToRoom(id);
            }
        });

        // unsubscribe removed
        roomSubsRef.current.forEach((_, id) => {
            if (!currentIds.has(id)) {
                unsubscribeFromRoom(id);
            }
        });
    }, [rooms, connected]);


    const cleanup = () => {
        notificationSubRef.current?.unsubscribe();
        notificationSubRef.current = null;
        clearAllRoomSubs();
        setConnected(false);
    };

    useEffect(() => {
        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 3000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            debug: (str) => console.log("[STOMP]", str),

            beforeConnect: async () => {
                client.connectHeaders = {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                };
            },

            onConnect: () => {
                setConnected(true);

                // clean previous just in case (defensive)
                notificationSubRef.current?.unsubscribe();

                notificationSubRef.current = client.subscribe(
                    "/user/queue/notifications",
                    (frame: IMessage) => {
                        console.log("notification", frame.body);
                    }
                );

                // reset room subs before resync
                clearAllRoomSubs();
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
    }, []);

    return (
        <StompContext.Provider
            value={{ client: clientRef.current, connected }}
        >
            {children}
        </StompContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStomp = () => useContext(StompContext);