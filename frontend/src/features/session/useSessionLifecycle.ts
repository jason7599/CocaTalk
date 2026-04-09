import { useEffect, useState } from "react";
import { sessionManager } from "./sessionManager";
import { useAuthStore } from "../auth/authStore";
import { useStomp } from "../../services/ws/stompContext";

export const useSessionLifecycle = () => {
    const { connected } = useStomp();

    const user = useAuthStore((s) => s.user);
    const isLoggedIn = !!user;
    const fetchMe = useAuthStore((s) => s.fetchMe);

    const [bootstrapping, setBootstrapping] = useState(true);

    useEffect(() => {
        const init = async () => {
            await fetchMe();
            setBootstrapping(false);
        }

        init();
    }, [fetchMe]);

    useEffect(() => {
        if (!isLoggedIn) {
            sessionManager.clearSession();
            return;
        }

        if (!connected) {
            return;
        }

        const run = async () => {
            setBootstrapping(true);

            try {
                await sessionManager.bootstrap();
            } finally {
                setBootstrapping(false);
            }
        };

        run();
    }, [isLoggedIn, connected]);

    return { bootstrapping };
};