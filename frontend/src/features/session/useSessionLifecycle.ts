import { useEffect, useState } from "react";
import { sessionManager } from "./sessionManager";
import { useAuthStore } from "../auth/authStore";

export const useSessionLifecycle = () => {
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

        const run = async () => {
            setBootstrapping(true);

            try {
                await sessionManager.bootstrap();
            } finally {
                setBootstrapping(false);
            }
        };

        run();
    }, [isLoggedIn]);

    return { bootstrapping };
};