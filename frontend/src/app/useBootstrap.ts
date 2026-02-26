import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthProvider";
import api from "../services/api";

export const useBootstrap = () => {
    const { isLoggedIn } = useAuth();

    const [bootstrapped, setBootstrapped] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoggedIn || bootstrapped) return;

        const run = async () => {
            setLoading(true);
            try {
                const res = (await api.get("/me/bootstrap")).data;

                console.log(res);
                setBootstrapped(true);
            } catch (err) {
                console.error("Bootstrap failed??", err);
            } finally {
                setLoading(false);
            }
        };

        run();
    });

    return { loading, bootstrapped };
};