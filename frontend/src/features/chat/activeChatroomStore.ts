import { create } from "zustand";
import { EMPTY_META, type ChatroomMeta, type MessageDto, type MessageInfo, type PendingUserMessage, type UserInfo } from "../../shared/types";
import { bootstrap } from "./chatroomApi";
import { useChatroomsStore } from "./chatroomsStore";
import { loadOlderMessages as apiLoadOlderMessages, sendMessage as apiSendMessage } from "./message/messageApi";
import { errorMessage } from "../../shared/utils/errors";

const ACK_DEBOUNCE_MS = 400;

type ActiveChatroomState = {
    // currently opened chatroom
    activeRoomId: number | null;

    // initial loading state
    status: "IDLE" | "LOADING" | "READY" | "ERROR";
    error: string | null;

    // room session contents
    meta: ChatroomMeta;
    members: Record<number, UserInfo>; // Todo: convert to list, as now MessageDto holds the actor_name
    messages: MessageInfo[];

    // pagination stuff 
    nextCursor: number; // 0 if not loaded or no messages

    hasOlderMessages: boolean;

    loadingOlderMessages: boolean;
    loadingNewerMessages: boolean;

    // for reconnection
    lastKnownSeq: number;

    // UI behavior for ACK
    isNearBottom: boolean; // whether user is currently near the bottom of the message list in the UI

    // ACK state
    _ackTimer: ReturnType<typeof setTimeout> | null; // timer ID for the debounced ACK flush
    _pendingAck: number; // highest seq number scheduled to be ACKed
    _lastSentAck: number; // last highest ACK actually sent to the server

    // stale fetch guards
    _epoch: number; // increments every time the active room changes, used to invalidate async fetches from previous rooms
    _abort: AbortController | null; // for canceling ongoing fetches when switching rooms

    setActiveChatroom: (roomId: number) => void;
    clearActiveChatroom: () => void;

    sendMessage: (content: string, actor: UserInfo) => void;
    receiveMessage: (msg: MessageDto) => void;

    loadOlderMessages: () => Promise<void>;

    setNearBottom: (near: boolean) => void;
    ackUpTo: (seq: number) => void;

    _scheduleAckFlush: () => void;
    _flushAckNow: () => void;

    _maybeAckLatestVisible: () => void;
};

function messageFromDto(dto: MessageDto): MessageInfo {
    return {
        ...dto,
        status: "PERSISTED"
    };
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

            meta: EMPTY_META,
            members: {},
            messages: [],

            nextCursor: 0,

            hasOlderMessages: false,

            loadingOlderMessages: false,
            loadingNewerMessages: false,

            lastKnownSeq: 0,

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
            const bootstrapData = await bootstrap(roomId);

            if (!isStillCurrent(roomId, epoch, abort)) return;

            const members = Object.fromEntries(
                bootstrapData.members.map((m) => [m.userId, m])
            );

            const page = bootstrapData.initialPage;

            set({
                status: "READY",
                meta: bootstrapData.meta,
                members,
                messages: page.messages.map(messageFromDto),

                nextCursor: page.nextCursor,

                hasOlderMessages: page.hasOlder,

                loadingOlderMessages: false,
                loadingNewerMessages: false,

                lastKnownSeq: 0,
            });

            // After initial load, if we're near bottom, typical, ack latest.
            get()._maybeAckLatestVisible();

        } catch (err: unknown) {
            if (!isStillCurrent(roomId, epoch, abort)) return;
            set({
                status: "ERROR",
                error: errorMessage(err)
            });
        }
    };

    return {

        activeRoomId: null,

        status: "IDLE",
        error: null,

        meta: EMPTY_META,
        members: {},
        messages: [],

        nextCursor: 0,

        hasOlderMessages: false,

        loadingOlderMessages: false,
        loadingNewerMessages: false,

        lastKnownSeq: 0,

        _epoch: 0,
        _abort: null,

        isNearBottom: true,
        _ackTimer: null,
        _pendingAck: 0,
        _lastSentAck: 0,

        setActiveChatroom: (roomId) => {
            if (get().activeRoomId === roomId) return;

            get()._abort?.abort();
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

                meta: EMPTY_META,
                members: {},
                messages: [],

                nextCursor: 0,

                hasOlderMessages: false,

                loadingOlderMessages: false,
                loadingNewerMessages: false,

                lastKnownSeq: 0,

                _epoch: get()._epoch + 1
            });
        },

        sendMessage: (content, actor) => {
            const roomId = get().activeRoomId;
            if (roomId == null) return;

            const clientId = crypto.randomUUID();

            const pending: PendingUserMessage = {
                roomId,
                actorId: actor.userId,
                actorName: actor.username,
                kind: "USER",
                status: "SENDING",
                content,
                clientId
            };

            // optimistic UI insert
            set((s) => ({
                messages: [...s.messages, pending]
            }));

            apiSendMessage(roomId, content, clientId);
        },

        receiveMessage: (dto) => {
            set((s) => {
                const lastKnownSeq = Math.max(s.lastKnownSeq, dto.seq);

                // Only append if user is near bottom
                if (s.isNearBottom) {
                    return {
                        messages: [...s.messages, messageFromDto(dto)],
                        lastKnownSeq,
                    };
                }

                // Otherwise, just advance the known seq
                return { lastKnownSeq };
            });
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
            if (s.activeRoomId == null) return;
            if (seq <= s._pendingAck) return;

            set({ _pendingAck: seq });

            // schedule a debounce flush
            s._scheduleAckFlush();

            useChatroomsStore.getState().setMyLastAck(s.activeRoomId, seq);
        },

        _maybeAckLatestVisible: () => {
            const s = get();

            if (!s.isNearBottom) return;
            if (s.status !== "READY") return;
            if (s.lastKnownSeq === 0) return;

            s.ackUpTo(s.lastKnownSeq);
        },

        _scheduleAckFlush: () => {
            const s = get();

            // only when no scheduled task
            if (s._ackTimer != null) return;

            const roomId = s.activeRoomId;

            const timer = window.setTimeout(() => {
                if (get().activeRoomId !== roomId) return;
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

            // todo: send ack

            set({
                _lastSentAck: pending,
                _ackTimer: null
            });
        },

        loadOlderMessages: async () => {
            const s = get();

            if (s.status !== "READY") return;

            const roomId = s.activeRoomId;

            if (roomId == null) return;
            if (s.loadingOlderMessages) return;
            if (!s.hasOlderMessages) return;
            if (s.nextCursor === 0) return;

            const epoch = s._epoch;
            const abort = s._abort;
            if (!abort) return;

            set({ loadingOlderMessages: true });

            try {
                const page = await apiLoadOlderMessages(roomId, {
                    cursor: s.nextCursor,
                    signal: abort.signal
                });

                if (!isStillCurrent(roomId, epoch, abort)) return;

                set((cur) => {
                    if (cur.status !== "READY") return {};

                    return {
                        messages: [...page.messages.map(messageFromDto), ...cur.messages],
                        nextCursor: page.nextCursor,
                        hasOlderMessages: page.hasOlder,
                        loadingOlderMessages: false
                    };
                });

            } catch (err: unknown) {
                if (!abort.signal.aborted) {
                    set({ error: errorMessage(err) });
                }

                if (isStillCurrent(roomId, epoch, abort)) {
                    set({ loadingOlderMessages: false });
                }
            }
        }


    };
});
