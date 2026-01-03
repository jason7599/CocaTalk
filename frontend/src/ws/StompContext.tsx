import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useActiveRoomStore } from "../store/activeRoomStore";

const WS_URL = import.meta.env.VITE_WS_URL;

type StompContextValue = {
    client: Client | null;
    connected: boolean;
};

const StompContext = createContext<StompContextValue>({ client: null, connected: false });

export const StompProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connected, setConnected] = useState(false);

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
                c.connectHeaders = { Authorization: `Bearer ${localStorage.getItem("token")}` };
            },

            onConnect: () => setConnected(true),
            onDisconnect: () => setConnected(false),
            onWebSocketClose: () => setConnected(false),
            onWebSocketError: () => setConnected(false),
            onStompError: () => setConnected(false),
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
