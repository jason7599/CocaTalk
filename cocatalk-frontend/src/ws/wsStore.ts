// src/store/wsStore.ts
import { create } from "zustand";
import { Client } from "@stomp/stompjs";
import { createStompClient } from "./stompClient";

interface WsState {
    client: Client | null;
    connected: boolean;
    connect: () => void;
    disconnect: () => void;
}

export const useWsStore = create<WsState>((set, get) => ({
    client: null,
    connected: false,

    connect: () => {
        // avoid creating multiple clients
        if (get().client) return;

        const client = createStompClient();

        client.onConnect = () => {
            console.log("STOMP connected");
            set({ connected: true });
        };

        client.onDisconnect = () => {
            console.log("STOMP disconnected");
            set({ connected: false });
        };

        client.activate();

        set({ client });
    },

    disconnect: () => {
        const client = get().client;
        if (client) {
            client.deactivate();
            set({ client: null, connected: false });
        }
    },
}));
