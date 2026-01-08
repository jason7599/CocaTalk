import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useActiveRoomStore } from "../store/activeRoomStore";
import type { MessagePreview } from "../types";
import { useChatroomsStore } from "../store/chatroomsStore";

const WS_URL = import.meta.env.VITE_WS_URL;

type StompContextValue = {
    client: Client | null;
    connected: boolean;
};

const StompContext = createContext<StompContextValue>({ client: null, connected: false });

export const StompProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const notificationSubRef = useRef<StompSubscription | null>(null);

    const closeConnection = () => {
        notificationSubRef.current?.unsubscribe();
        notificationSubRef.current = null;
        setConnected(false);
    };

    const client = useMemo(() => {
        const c = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 3000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            // todo: remove
            debug: (str) => console.log("[STOMP]", str),

            // Ensure latest token is used on every connect/reconnect
            beforeConnect: async () => {
                c.connectHeaders = {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                };
            },

            onConnect: () => {
                setConnected(true);

                // defensive
                notificationSubRef.current?.unsubscribe();
                notificationSubRef.current = c.subscribe(
                    "/user/queue/notifications",
                    (frame: IMessage) => {
                        const messagePreview: MessagePreview = JSON.parse(frame.body);
                        useChatroomsStore.getState().onNewMessage(messagePreview);
                    }
                );
            },
            onDisconnect: closeConnection,
            onWebSocketClose: closeConnection,
            onWebSocketError: closeConnection,
            onStompError: closeConnection,
        });

        return c;
    }, []);

    useEffect(() => {
        if (!client.active) client.activate();
        return () => { client.deactivate(); };
    }, [client]);

    useEffect(() => {
        useActiveRoomStore.getState().bindStomp(client, connected);
    }, [client, connected]);

    return <StompContext.Provider value={{ client, connected }}>{children}</StompContext.Provider>;
};

export const useStomp = () => useContext(StompContext);
