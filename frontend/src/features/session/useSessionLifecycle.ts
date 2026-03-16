import { useEffect, useState } from "react";
import { sessionManager } from "./sessionManager";
import { useAuthStore } from "../auth/authStore";

export const useSessionLifecycle = () => {
    const user = useAuthStore((s) => s.user);
    const isLoggedIn = !!user;

    const [bootstrapping, setBootstrapping] = useState(false);

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