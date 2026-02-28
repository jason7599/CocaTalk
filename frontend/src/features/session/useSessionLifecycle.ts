import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { sessionManager } from "./sessionManager";

export const useSessionLifecycle = () => {
    const { isLoggedIn } = useAuth();
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