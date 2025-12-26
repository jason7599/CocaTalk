// useActiveRoomSubscription.ts
import { useEffect, useRef } from "react";
import type { IMessage, StompSubscription } from "@stomp/stompjs";
import { useStomp } from "./StompContext";

/**
 * Subscribes to a single STOMP topic for the currently active room
 * Unsubscribes previous topic upon change or connection drop
 */
export function useActiveRoomSubscription(
    activeRoomId: number | null,
    onRoomMessage: (roomId: number, msg: IMessage) => void
) {
    const { client, connected } = useStomp();

    // current subscription object
    const subRef = useRef<StompSubscription | null>(null);


    /**
     * monotonic counter as a race-condition guard
     * Every subscription increments the token
     * Anything from older tokens is invalidated
     */
    const tokenRef = useRef(0);

    useEffect(() => {
        if (!connected) {
            return;
        }

        // create token
        const token = ++tokenRef.current;

        // Always unsubscribe previous subscription first
        if (subRef.current) {
            try {
                subRef.current.unsubscribe();
            } finally {
                subRef.current = null;
            }
        }

        if (!activeRoomId) return;

        subRef.current = client.subscribe(
            `/topic/rooms.${activeRoomId}`,
            (msg) => {
                if (token !== tokenRef.current) return;
                onRoomMessage(activeRoomId, msg);
            }
        );

        // console.log(`subscribed to /topic/rooms.${activeRoomId}`);

        return () => {
            // Only unsubscribe if still current
            if (token === tokenRef.current && subRef.current) {
                try {
                    // console.log("unsubscribing from old topic");
                    subRef.current.unsubscribe();
                } finally {
                    subRef.current = null;
                }
            }
        };
    }, [client, connected, activeRoomId, onRoomMessage]);
}
