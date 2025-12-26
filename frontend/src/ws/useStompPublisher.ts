import { useCallback, useEffect, useRef } from "react";
import { useStomp } from "./StompContext";

type PublishArgs = {
    destination: string;
    body: string;
    headers?: Record<string, string>;
};

export function useStompPublisher() {
    const { client, connected } = useStomp();
    const queueRef = useRef<PublishArgs[]>([]);

    const publish = useCallback(
        (destination: string, payload: unknown, headers: Record<string, string> = {}) => {
            const msg: PublishArgs = {
                destination,
                body: JSON.stringify(payload),
                headers: { "content-type": "application/json", ...headers },
            };

            if (!client || !connected) {
                queueRef.current.push(msg);
                return { queued: true };
            }

            client.publish(msg);
            return { queued: false };
        },
        [client, connected]
    );

    useEffect(() => {
        if (!client || !connected) {
            return;
        }

        // flush
        const q = queueRef.current;
        queueRef.current = [];

        for (const msg of q) {
            client.publish(msg);
        }
    }, [client, connected]);

    return { publish, connected };
};