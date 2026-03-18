import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useChatroomsStore } from "../../features/chat/chatroomsStore";

const WS_URL = import.meta.env.VITE_WS_URL;

type StompContextValue = {
    client: Client | null;
    connected: boolean;
};

const StompContext = createContext<StompContextValue>({ client: null, connected: false });

export const StompProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connected, setConnected] = useState(false);

    const clientRef = useRef<Client | null>(null);
    const notificationSubRef = useRef<StompSubscription | null>(null);
    const roomSubsRef = useRef<Map<number, StompSubscription>>(new Map());

    const subscribeToRoom = useCallback((roomId: number) => {
        const client = clientRef.current;
        if (!client || !connected) return;
        if (roomSubsRef.current.has(roomId)) return;

        const sub = client.subscribe(
            `/topic/chatroom.${roomId}`,
            (frame: IMessage) => {
                // TODO: route message into store
                console.log("room msg", roomId, frame.body);
            }
        );

        roomSubsRef.current.set(roomId, sub);
    }, [connected]);

    const unsubscribeFromRoom = useCallback((roomId: number) => {
        const sub = roomSubsRef.current.get(roomId);
        if (!sub) return;

        sub.unsubscribe();
        roomSubsRef.current.delete(roomId);
    }, []);

    /**
     * Sync subscriptions with current chatrooms in chatroomsStore
    */
    const syncRoomSubscriptions = useCallback(() => {
        const client = clientRef.current;
        if (!client || !connected) return;

        const rooms = useChatroomsStore.getState().chatrooms;
        const currentRoomIds = new Set(rooms.map(r => r.roomId));

        // Subscribe to new rooms
        currentRoomIds.forEach(roomId => {
            if (!roomSubsRef.current.has(roomId)) {
                subscribeToRoom(roomId);
            }
        });

        // Unsubscribe from removed rooms
        roomSubsRef.current.forEach((_, roomId) => {
            if (!currentRoomIds.has(roomId)) {
                unsubscribeFromRoom(roomId);
            }
        });
    }, [connected, subscribeToRoom, unsubscribeFromRoom]);

    const closeConnection = useCallback(() => {
        notificationSubRef.current?.unsubscribe();
        notificationSubRef.current = null;

        roomSubsRef.current.forEach(s => s.unsubscribe());
        roomSubsRef.current.clear();

        setConnected(false);
    }, []);

    useEffect(() => {
        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 3000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            // todo: remove on prod
            debug: (str) => console.log("[STOMP]", str),

            // Ensure latest token is used on every connect/reconnect
            beforeConnect: async () => {
                client.connectHeaders = {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                };
            },

            onConnect: () => {
                setConnected(true);

                // defensive
                notificationSubRef.current?.unsubscribe();
                notificationSubRef.current = client.subscribe(
                    "/user/queue/notifications",
                    (frame: IMessage) => {
                        console.log("notification", frame.body);
                    }
                );
                
                // clear stale subs
                roomSubsRef.current.clear();

                syncRoomSubscriptions();
            },
            onDisconnect: closeConnection,
            onWebSocketClose: closeConnection,
            onWebSocketError: closeConnection,
            onStompError: closeConnection,
        });

        clientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
            closeConnection();
        };
    }, [closeConnection, syncRoomSubscriptions]);

    return <StompContext.Provider value={{ client: clientRef.current, connected }}>{children}</StompContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStomp = () => useContext(StompContext);
