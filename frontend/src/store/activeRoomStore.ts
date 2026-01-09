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

    // ack internals
    // _isNearBottom: boolean;
    // _ackTimer: number | null;
    // _pendingAck: number;
    // _lastSentAck: number;

    // actions
    bindStomp: (client: Client | null, connected: boolean) => void;

    setActiveRoom: (roomId: number | null) => void;
    clearActiveRoom: () => void;

    sendMessage: (content: string) => void;

    setNearBottom: (near: boolean) => void;
    ackUpTo: (seq: number) => void;

    loadOlderMessages: () => void;
};

export const useActiveRoomStore = create<ActiveRoomState>((set, get) => {

    const cancelInFlight = () => {
        const { _abort, _sub } = get();
        _abort?.abort();
        _sub?.unsubscribe();
        set({ 
            _abort: null, 
            _sub: null,
            // _ackTimer: null,
            // _pendingAck: 0 
        });
    };

    const beginRoomTransaction = (roomId: number) => {
        const nextEpoch = get()._epoch + 1;
        const abort = new AbortController();

        set({
            activeRoomId: roomId,
            status: "LOADING",
            error: null,

            members: {},

            messages: [],
            nextCursor: null,
            hasMoreMessages: false,
            loadingOlderMessages: false,

            _abort: abort,
            _sub: null,
            _epoch: nextEpoch,
        });

        return { nextEpoch, abort };
    };

    const isStillCurrent = (roomId: number, epoch: number, abort: AbortController) => {
        if (abort.signal.aborted) return false;
        const s = get();
        return s.activeRoomId === roomId && s._epoch === epoch;
    };

    const subscribeToRoomTopic = (roomId: number) => {
        const { stompClient, stompConnected } = get();
        if (!stompClient || !stompConnected) return null;

        const destination = `/topic/rooms.${roomId}`;
        return stompClient.subscribe(destination, (frame: IMessage) => {
            const msg: MessageResponse = JSON.parse(frame.body);

            if (get().activeRoomId !== msg.roomId) return;

            set((s) => ({ messages: [...s.messages, msg] }));
        })
    };

    const loadInitialRoomData = async (roomId: number, epoch: number, abort: AbortController) => {
        try {
            const [messagePage, memberInfos] = await Promise.all([
                loadMessages(roomId, { signal: abort.signal }),
                getMembersInfo(roomId, { signal: abort.signal })
            ]);

            if (!isStillCurrent(roomId, epoch, abort)) return;

            const members = Object.fromEntries(memberInfos.map((m) => [m.id, m]));

            set({
                status: "READY",
                messages: messagePage.messages,
                nextCursor: messagePage.nextCursor,
                hasMoreMessages: messagePage.hasMore,
                members
            });
        } catch (err: any) {
            if (!isStillCurrent(roomId, epoch, abort)) return;
            set({ status: "ERROR", error: err.message });
        }
    };

    return {
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

        // bind stomp & active room lifecycle together
        // re-runs every time stomp client updates, thanks to StompContext.tsx
        bindStomp: (client, connected) => {
            set({ stompClient: client, stompConnected: connected });

            const { activeRoomId } = get();
            if (connected && client && activeRoomId) {
                get().setActiveRoom(activeRoomId);
            }

            if (!connected) {
                get()._sub?.unsubscribe();
                set({ _sub: null });
            }
        },

        setActiveRoom: (roomId) => {
            if (!roomId) {
                get().clearActiveRoom();
                return;
            }

            cancelInFlight();

            const { nextEpoch, abort } = beginRoomTransaction(roomId);

            const sub = subscribeToRoomTopic(roomId);
            if (sub) set({ _sub: sub });

            loadInitialRoomData(roomId, nextEpoch, abort);
        },

        clearActiveRoom: () => {
            cancelInFlight();
            set({
                activeRoomId: null,
                status: "IDLE",
                error: null,

                members: {},

                messages: [],
                nextCursor: null,
                hasMoreMessages: false,
                loadingOlderMessages: false,
                
                _epoch: get()._epoch + 1
            });
        },

        sendMessage: (content) => {
            const { stompClient, stompConnected, activeRoomId } = get();
            
            if (!stompClient || !stompConnected) return;
            if (activeRoomId == null) return;

            stompClient.publish({
                destination: `/app/chat.send.${activeRoomId}`,
                body: JSON.stringify({ content })
            });
        },

        loadOlderMessages: () => {

        }
    }
});