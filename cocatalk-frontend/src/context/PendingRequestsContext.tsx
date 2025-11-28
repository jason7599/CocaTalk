import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PendingRequest } from "../types";
import { acceptFriendRequest, listPendingRequests, removeFriendRequest } from "../api/friendship";

interface PendingRequestsContextType {
    requests: PendingRequest[];
    pendingCount: number;
    loading: boolean;
    error: string | null;
    accept: (senderId: number) => Promise<void>;
    decline: (senderId: number) => Promise<void>;
};

const PendingRequestsContext = createContext<PendingRequestsContextType | undefined>(undefined);

export const PendingRequestsProvider: React.FC<{ children: ReactNode }> = ({
    children
}) => {
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await listPendingRequests();

                setRequests(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const accept = async (senderId: number) => {
        await acceptFriendRequest(senderId);
        setRequests((prev) => prev.filter((r) => r.senderId !== senderId));
    }

    const decline = async (senderId: number) => {
        await removeFriendRequest(senderId);
        setRequests((prev) => prev.filter((r) => r.senderId !== senderId));
    }

    return (
        <PendingRequestsContext.Provider
            value={{
                requests,
                pendingCount: requests.length,
                loading,
                error,
                accept,
                decline
            }}
        >
            {children}
        </PendingRequestsContext.Provider>
    );
};

export const usePendingRequests = (): PendingRequestsContextType => {
    const ctx = useContext(PendingRequestsContext);
    if (!ctx) {
        throw new Error(
            "usePendingRequests must be used within a PendingRequestsProvider"
        );
    }
    return ctx;
};