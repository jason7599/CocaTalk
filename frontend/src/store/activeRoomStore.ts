import type { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import type { ChatMemberInfo, MessageResponse } from "../types";
import { create } from "zustand";
import { getMembersInfo, loadMessages } from "../api/chatrooms";

type Status = "IDLE" | "LOADING" | "READY" | "ERROR";

type ActiveRoomState = {
    // stomp binding
    stompClient: Client | null;
    stompConnected: boolean;

    activeRoomId: number | null;
    status: Status;
    error: string | null;

    members: Record<number, ChatMemberInfo>;

    messages: MessageResponse[];
    nextCursor: number | null;
    hasMoreMessages: boolean;
    loadingOlderMessages: boolean;

    // internals
    _sub: StompSubscription | null;
    _abort: AbortController | null;
    _epoch: number;

    // actions
    bindStomp: (client: Client | null, connected: boolean) => void;
    setActiveRoom: (roomId: number | null) => void;
    clearActiveRoom: () => void;

    loadOlderMessages: () => void;
};

export const useActiveRoomStore = create<ActiveRoomState>((set, get) => ({
    stompClient: null,
    stompConnected: false,

    activeRoomId: null,
    status: "IDLE",
    error: null,

    members: {},

    messages: [],
    nextCursor: null,
    hasMoreMessages: false,
    loadingOlderMessages: false,

    _sub: null,
    _abort: null,
    _epoch: 0,

    
    bindStomp: (client, connected) => {
        set({ stompClient: client, stompConnected: connected });

        const { activeRoomId } = get();
        if (connected && client && activeRoomId) {
            get().setActiveRoom(activeRoomId);
        }

        if (!connected) {
            const { _sub } = get();
            _sub?.unsubscribe();
            set({ _sub: null });
        }
    },

    setActiveRoom: (roomId) => {
        if (!roomId) {
            get().clearActiveRoom();
            return;
        }

        const { stompClient, stompConnected } = get();

        // cancel previous work
        get()._abort?.abort();
        get()._sub?.unsubscribe();

        const nextEpoch = get()._epoch + 1;
        const abort = new AbortController();

        set({
            activeRoomId: roomId,
            status: "LOADING",
            error: null,
            members: [],
            messages: [],
            nextCursor: null,
            hasMoreMessages: false,
            loadingOlderMessages: false,
            _abort: abort,
            _sub: null,
            _epoch: nextEpoch
        });

        if (stompClient && stompConnected) {
            const destination = `/topics/rooms.${roomId}`;
            const sub = stompClient.subscribe(destination, (frame: IMessage) => {
                const msg: MessageResponse = JSON.parse(frame.body);

                const { activeRoomId: cur } = get();
                if (cur !== msg.roomId) {
                    return;
                }

                set((s) => ({ messages: [...s.messages, msg] }));
            });

            set({ _sub: sub });
        }

        // Load room data
        (async () => {
            try {
                const [messagePage, memberInfos] = await Promise.all([
                    loadMessages(roomId, { signal: abort.signal }),
                    getMembersInfo(roomId, { signal: abort.signal })
                ]);
                if (abort.signal.aborted) return;

                const { _epoch, activeRoomId } = get();
                if (_epoch !== nextEpoch) return;
                if (activeRoomId !== roomId) return;

                const members = Object.fromEntries(
                    memberInfos.map(m => [m.id, m])
                );

                set({
                    status: "READY",
                    messages: messagePage.messages,
                    nextCursor: messagePage.nextCursor,
                    hasMoreMessages: messagePage.hasMore,
                    members
                });
            } catch (err: any) {
                if (abort.signal.aborted) return;
                if (get()._epoch !== nextEpoch) return;

                set({ status: "ERROR", error: err.message });
            }
        })();
    },

    clearActiveRoom: () => {
        const { _abort, _sub } = get();
        _abort?.abort();
        _sub?.unsubscribe();
        set({
            activeRoomId: null,
            status: "IDLE",
            error: null,
            members: [],
            messages: [],
            nextCursor: null,
            hasMoreMessages: false,
            loadingOlderMessages: false,
            _abort: null,
            _sub: null,
            _epoch: get()._epoch + 1
        });
    },

    loadOlderMessages: () => {

    }
}));