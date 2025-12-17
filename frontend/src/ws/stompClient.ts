// src/ws/stompClient.ts
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_ENDPOINT = import.meta.env.VITE_WS_URL;

let stompClient: Client | null = null;

export const createStompClient = (): Client => {
    if (stompClient) return stompClient;
    
    const token = localStorage.getItem('token') ?? '';

    stompClient = new Client({
        // Called when STOMP client wants a WebSocket
        webSocketFactory: () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new SockJS(WS_ENDPOINT) as any;
        },
        connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000, // ms
        debug: (msg: string) => {
            // todo: remove this in prod
            console.log("[STOMP]", msg);
        },
        onStompError: (frame) => {
            console.error("Broker reported error:", frame.headers["message"]);
            console.error("Additional details:", frame.body);
        },
    });

    return stompClient;
};

export type StompMessageHandler = (message: IMessage) => void;

export const subscribeToDestination = (
    client: Client,
    destination: string,
    handler: StompMessageHandler
): StompSubscription => {
    return client.subscribe(destination, handler);
};
