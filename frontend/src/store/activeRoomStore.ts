import type { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import type { ChatMemberInfo, MessageResponse } from "../types";
import { create } from "zustand";
import { getMembersInfo, loadMessages } from "../api/chatrooms";
import { useChatroomsStore } from "./chatroomsStore";
import { useUserStore } from "./userStore";

const ACK_DEBOUNCE_MS = 400;

type Status = "IDLE" | "LOADING" | "READY" | "ERROR";

type Endpoint =
    | { dmProxy: false, roomId: number }
    | { dmProxy: true, otherUserId: number };

type ActiveRoomState = {
    stompClient: Client | null;
    stompConnected: boolean;

    chatEndpoint: Endpoint | null;
    status: Status;
    error: string | null;

    members: Record<number, ChatMemberInfo>;

    messages: MessageResponse[];
    nextCursor: number | null;
    hasMoreMessages: boolean;
    loadingOlderMessages: boolean;

    _sub: StompSubscription | null;
    _abort: AbortController | null;
    _epoch: number;

    // ---- ACK STATE ----
    _isNearBottom: boolean;
    _ackTimer: number | null; // timer ID
    _ackDebounceMs: number; // tweak
    _pendingAck: number; // scheduled ack
    _lastSentAck: number; // last ack actually sent to servers, deduplication guard

    bindStomp: (client: Client | null, connected: boolean) => void;

    setActiveRoom: (roomId: number | null) => void;
    clearActiveRoom: () => void;

    sendMessage: (content: string) => void;

    setNearBottom: (near: boolean) => void;
    ackUpTo: (seq: number) => void;

    _flushAck: (force?: boolean) => void;
    _maybeAckLatestVisible: () => void;

    loadOlderMessages: () => Promise<void>;
};

export const useActiveRoomStore = create<ActiveRoomState>((set, get) => {

    const cancelInFlight = () => {
        const { _abort, _sub, _ackTimer } = get();
        _abort?.abort();
        _sub?.unsubscribe();

        if (_ackTimer != null) window.clearTimeout(_ackTimer);

        set({
            _abort: null,
            _sub: null,
            _ackTimer: null,
            _pendingAck: 0,
            _lastSentAck: 0,
            _isNearBottom: true,
        });
    };

    const beginRoomTransaction = (roomId: number) => {
        const nextEpoch = get()._epoch + 1;
        const abort = new AbortController();

        set({
            chatEndpoint: { dmProxy: false, roomId },
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

            _isNearBottom: true,
            _ackTimer: null,
            _pendingAck: 0,
            _lastSentAck: 0,
        });

        return { nextEpoch, abort };
    };

    const isStillCurrent = (roomId: number, epoch: number, abort: AbortController) => {
        if (abort.signal.aborted) return false;
        const s = get();
        return s.chatEndpoint && !s.chatEndpoint.dmProxy && s.chatEndpoint.roomId === roomId && s._epoch === epoch;
    };

    const subscribeToRoomTopic = (roomId: number) => {
        const { stompClient, stompConnected } = get();
        if (!stompClient || !stompConnected) return null;

        const destination = `/topic/rooms.${roomId}`;
        return stompClient.subscribe(destination, (frame: IMessage) => {
            const msg: MessageResponse = JSON.parse(frame.body);
            const { chatEndpoint } = get();

            // closed or to switched to other chatroom 
            if (!chatEndpoint || (!chatEndpoint.dmProxy && chatEndpoint.roomId !== msg.roomId)) return;

            set((s) => {
                const next = [...s.messages, msg];
                return { messages: next };
            });

            const me = useUserStore.getState().user;
            if (me && msg.senderId === me.id) {
                get().ackUpTo(msg.seqNo);
                get()._flushAck(true);
            } else {
                // If user is at/near bottom, auto-ack newest message.
                // If not near bottom, leave it pending until they scroll down.
                get()._maybeAckLatestVisible();
            }

        });
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

            // After initial load, if we're near bottom (typical), ack latest.
            get()._maybeAckLatestVisible();
        } catch (err: any) {
            if (!isStillCurrent(roomId, epoch, abort)) return;
            set({ status: "ERROR", error: err.message });
        }
    };

    // Helper to read seq from last message
    const getLastSeq = () => {
        const { messages } = get();
        const last = messages[messages.length - 1];
        return last?.seqNo ?? -1;
    };

    return {
        stompClient: null,
        stompConnected: false,

        chatEndpoint: null,
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

        // ---- ACK DEFAULTS ----
        _isNearBottom: true,
        _ackTimer: null,
        _ackDebounceMs: ACK_DEBOUNCE_MS,
        _pendingAck: 0,
        _lastSentAck: 0,

        bindStomp: (client, connected) => {
            set({ stompClient: client, stompConnected: connected });

            const { chatEndpoint } = get();
            if (connected && client && chatEndpoint && !chatEndpoint.dmProxy) {
                get().setActiveRoom(chatEndpoint.roomId);
            }

            if (!connected) {
                // flush ack best-effort before losing connection
                get()._flushAck(true);

                get()._sub?.unsubscribe();
                set({ _sub: null });
            }
        },

        setActiveRoom: (roomId) => {
            if (!roomId) {
                get().clearActiveRoom();
                return;
            }

            // leaving previous room: flush ack
            get()._flushAck(true);
            
            cancelInFlight();

            const { nextEpoch, abort } = beginRoomTransaction(roomId);

            const sub = subscribeToRoomTopic(roomId);
            if (sub) set({ _sub: sub });

            loadInitialRoomData(roomId, nextEpoch, abort);
        },

        clearActiveRoom: () => {
            // flush ack best-effort
            get()._flushAck(true);

            cancelInFlight();
            set({
                chatEndpoint: null,
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
            const { stompClient, stompConnected, chatEndpoint } = get();

            if (!stompClient || !stompConnected) return;
            if (chatEndpoint == null) return;

            if (chatEndpoint.dmProxy) {
                // todo: REST API for sending the first message & publishing new event
            } else {
                stompClient.publish({
                    destination: `/app/chat.send.${chatEndpoint.roomId}`,
                    body: JSON.stringify({ content })
                });
            }

        },

        // ---- ACK PUBLIC API ----

        setNearBottom: (near) => {
            const prev = get()._isNearBottom;
            set({ _isNearBottom: near });

            // If user just scrolled back to bottom, ack whatever is now visible/latest.
            if (!prev && near) {
                get()._maybeAckLatestVisible();
            }
        },

        ackUpTo: (seq) => {
            // monotonic: never go backwards
            const s = get();
            const nextPending = Math.max(s._pendingAck, seq);

            if (!s.chatEndpoint || s.chatEndpoint.dmProxy) return;

            // if no real change, do nothing
            if (nextPending <= s._pendingAck) return;

            set({ _pendingAck: nextPending });

            useChatroomsStore.getState().setMyLastAck(s.chatEndpoint.roomId, nextPending);

            // schedule a debounce flush
            get()._flushAck(false);
        },

        _maybeAckLatestVisible: () => {
            const s = get();
            if (!s._isNearBottom) return;

            const lastSeq = getLastSeq();
            if (lastSeq >= 0) {
                get().ackUpTo(lastSeq);
            }
        },

        _flushAck: (force = false) => {
            const s = get();

            // If not connected, we can't send now; keep pending in memory
            if (!s.stompClient || !s.stompConnected || s.chatEndpoint == null || s.chatEndpoint.dmProxy) {
                return;
            }

            const doSend = () => {
                const cur = get();
                if (cur.chatEndpoint == null || cur.chatEndpoint.dmProxy) return;

                const roomId = cur.chatEndpoint.roomId;
                if (!roomId) return;

                const pending = cur._pendingAck;
                const lastSent = cur._lastSentAck;

                // only send if it advances
                if (pending <= lastSent) return;

                cur.stompClient!.publish({
                    destination: `/app/chat.ack.${roomId}`,
                    body: JSON.stringify({ ack: pending })
                });

                set({ _lastSentAck: pending, _ackTimer: null });
            };

            // Force: cancel debounce and send now
            if (force) {
                if (s._ackTimer != null) window.clearTimeout(s._ackTimer);
                set({ _ackTimer: null });
                doSend();
                return;
            }

            // Debounced: if a timer exists, let it fire
            if (s._ackTimer != null) return;

            const timer = window.setTimeout(() => {
                doSend();
            }, s._ackDebounceMs);

            set({ _ackTimer: timer });
        },

        loadOlderMessages: async () => {
            const s = get();
            if (!s.chatEndpoint || s.chatEndpoint.dmProxy) return;

            const roomId = s.chatEndpoint.roomId;

            if (roomId == null) return;
            if (s.status !== "READY") return;

            if (s.loadingOlderMessages) return;
            if (!s.hasMoreMessages) return;
            if (s.nextCursor == null) return;

            const epoch = s._epoch;
            const abort = s._abort;
            if (!abort) return;

            set({ loadingOlderMessages: true });

            try {
                const page = await loadMessages(roomId, {
                    cursor: s.nextCursor,
                    signal: abort?.signal,
                });

                if (!isStillCurrent(roomId, epoch, abort)) {
                    return;
                }

                set((cur) => {
                    return {
                        messages: [...page.messages, ...cur.messages],
                        nextCursor: page.nextCursor,
                        hasMoreMessages: page.hasMore
                    };
                });
            } catch (err: any) {
                if (!abort.signal.aborted) {
                    set({ error: err.message });
                }
            } finally {
                set({ loadingOlderMessages: false });
            }
        }
    };
});
