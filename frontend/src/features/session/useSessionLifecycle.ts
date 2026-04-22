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
        }
        init();
    }, [fetchMe]);

    useEffect(() => {
        if (!isLoggedIn) {
            sessionManager.clearSession();
            setBootstrapping(false);
            return;
        }

        if (!connected) {
            return;
        }

        const run = async () => {
            console.log("========BOOTSTRAPPING START========");
            setBootstrapping(true);

            try {
                await sessionManager.bootstrap();
            } finally {
                setBootstrapping(false);
            }

            console.log("========BOOTSTRAPPING FINISH========");
        };

        run();
    }, [isLoggedIn, connected]);

    return { bootstrapping };
};