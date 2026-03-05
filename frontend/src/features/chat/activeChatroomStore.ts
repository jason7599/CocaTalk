import { create } from "zustand";
import type { UserInfo } from "../../shared/types";

const ACK_DEBOUNCE_MS = 400;

type ActiveChatroomState = {
    // currently opened chatroom
    activeRoomId: number | null;

    // initial loading state
    status: "IDLE" | "LOADING" | "READY" | "ERROR";
    error: string | null;

    members: Record<number, UserInfo>; // Record allows username resolution when displaying messages
    messages: MessageResponse[];

    // pagination stuff 
    nextCursor: number | null;
    hasMoreMessages: boolean;
    loadingOlderMessages: boolean;

    // UI behavior for ACK
    isNearBottom: boolean; // whether user is currently near the bottom of the message list in the UI

    // ACK state
    _ackTimer: number | null; // timer ID for the debounced ACK flush
    _pendingAck: number; // highest seq number scheduled to be ACKed
    _lastSentAck: number; // last highest ACK actually sent to the server

    // stale fetch guards
    _epoch: number; // increments every time the active room changes, used to invalidate async fetches from previous rooms
    _abort: AbortController | null; // for canceling ongoing fetches when switching rooms
    
    setActiveChatroom: (roomId: number) => void;
    clearActiveChatroom: () => void;

    sendMessage: (content: string) => void;
    receiveMessage: (msg: MessageResponse) => void;

    loadOlderMessages: () => Promise<void>;

    setNearBottom: (near: boolean) => void;
    ackUpTo: (seq: number) => void;

    _scheduleAckFlush: () => void;
    _flushAckNow: () => void;

    _maybeAckLatestVisible: () => void;
};

/**
 * Active Chatroom Store
 * 
 * Responsibilities:
 * - Manage the currently opened chatroom
 * - Loads inital room info (messages, member info, etc)
 * - Handles pagination for older messages
 * - Upsert incoming messages
 * - Track ACKs and send them with debounce
*/
export const useActiveChatroomStore = create<ActiveChatroomState>((set, get) => {

    /**
     * Sets the activeRoomId, and starts a new room transaction by:
     * 1. Incrementing the _epoch, invalidates previous requests
     * 2. Create a new abort controller
     * 3. Reset room related state
    */
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
            _epoch: nextEpoch,
            
            isNearBottom: true,
            _ackTimer: null,
            _pendingAck: 0,
            _lastSentAck: 0,
        });

        return { epoch: nextEpoch, abort };
    };

    /** Ensure a response still belongs to the current room */
    const isStillCurrent = (roomId: number, epoch: number, abort: AbortController) => {
        if (abort.signal.aborted) return false;
        const s = get();
        return s.activeRoomId === roomId && s._epoch === epoch;
    };

    const loadInitialRoomData = async (roomId: number, epoch: number, abort: AbortController) => {
        try {
            // todo: fetch ChatroomMeta, Members & message page
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
            set({
                status: "ERROR",
                error: err.message
            });
        }
    };

    return {

        activeRoomId: null,

        status: "IDLE",
        error: null,

        members: {},
        messages: [],

        nextCursor: null,
        hasMoreMessages: false,
        loadingOlderMessages: false,
        
        _epoch: 0,
        _abort: null,
        
        isNearBottom: true,
        _ackTimer: null,
        _pendingAck: 0,
        _lastSentAck: 0,

        setActiveChatroom: (roomId) => {
            const prevAbort = get()._abort;
            prevAbort?.abort();

            get()._flushAckNow(); // acks are forced when changing rooms

            const { epoch, abort } = beginRoomTransaction(roomId);

            loadInitialRoomData(roomId, epoch, abort);
        },

        clearActiveChatroom: () => {
            get()._abort?.abort();
            get()._flushAckNow();

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
            const roomId = get().activeRoomId;
            if (roomId == null) return;

            const body = {
                roomId,
                content
            };

            console.log("Send", body);

            // todo
            // stompClient.publish({
            //     destination: "/app/chat.send",
            //     body: JSON.stringify(body)
            // });
        },

        receiveMessage: (msg) => {
            console.log("receive", msg);
        },
        
        // ack public api
        setNearBottom: (near) => {
            const prev = get().isNearBottom;
            set({ isNearBottom: near });

            // If user just scrolled back to bottom, ack whatever is now visible
            if (!prev && near) {
                get()._maybeAckLatestVisible();
            }
        },

        ackUpTo: (seq) => {
            // monotonic
            const s = get();
            if (seq <= s._pendingAck) return;

            set({ _pendingAck: seq });
            
            // schedule a debounce flush
            get()._scheduleAckFlush();
            
            // todo: useChatroomsStore.getState().setMyLastAck(s.chatEndpoint.roomId, nextPending);
        },
        
        _maybeAckLatestVisible: () => {
            const s = get();
            
            if (!s.isNearBottom) return;
            if (s.messages.length === 0) return;

            get().ackUpTo(s.messages.at(-1).seq);
        },

        _scheduleAckFlush: () => {
            const s = get();

            // only when no scheduled task
            if (s._ackTimer != null) return;

            const roomId = s.activeRoomId;

            const timer = window.setTimeout(() => {
                const cur = get();
                if (cur.activeRoomId !== roomId) return;
                get()._flushAckNow();
            }, ACK_DEBOUNCE_MS);

            set({ _ackTimer: timer });
        },

        _flushAckNow: () => {
            const s = get();

            if (s._ackTimer != null) {
                window.clearTimeout(s._ackTimer);
            }

            const roomId = s.activeRoomId;

            if (roomId == null) {
                set({ _ackTimer: null });
                return;
            }

            const pending = s._pendingAck;
            const lastSent = s._lastSentAck;

            if (pending <= lastSent) {
                set({ _ackTimer: null });
                return;
            }

            // todo: send ack via STOMP

            set({
                _lastSentAck: pending,
                _ackTimer: null
            });
        },

        loadOlderMessages: async () => {
            const s = get();
            const roomId = s.activeRoomId;

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
                if (isStillCurrent(roomId, epoch, abort)) {
                    set({ loadingOlderMessages: false });
                }
            }
        },
    };
});
