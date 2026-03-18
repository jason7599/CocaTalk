import { create } from "zustand";
import { EMPTY_META, type ChatroomMeta, type MessageDto, type PendingUserMessage, type UserInfo } from "../../../shared/types";
import { apiLoadOlderMessages, apiSendMessage } from "../message/messageApi";
import { errorMessage } from "../../../shared/utils/errors";
import { useAuthStore } from "../../auth/authStore";
import { createAckActions, type AckActions } from "./activeChatroomAck";
import { createSessionActions, type SessionActions } from "./activeChatroomSession";

export type ActiveChatroomState = 
    AckActions & 
    SessionActions &
{
    // currently opened chatroom
    activeRoomId: number | null;

    // initial loading state
    status: "IDLE" | "LOADING" | "READY" | "ERROR";
    error: string | null;

    // room session contents
    meta: ChatroomMeta;
    members: UserInfo[];

    messages: MessageDto[];
    pendingMessages: PendingUserMessage[];

    // pagination stuff 
    nextCursor: number; // 0 if not loaded or no messages
    hasOlderMessages: boolean;

    loadingOlderMessages: boolean;

    // for reconnection
    lastKnownSeq: number;

    // UI behavior for ACK, public
    isNearBottom: boolean; // whether user is currently near the bottom of the message list in the UI

    // ACK state
    _ackTimer: ReturnType<typeof setTimeout> | null; // timer ID for the debounced ACK flush
    _pendingAck: number; // highest seq number scheduled to be ACKed
    _lastSentAck: number; // last highest ACK actually sent to the server

    // stale fetch guards
    _epoch: number; // increments every time the active room changes, used to invalidate async fetches from previous rooms
    _abort: AbortController | null; // for canceling ongoing fetches when switching rooms

    sendMessage: (content: string) => void;
    receiveMessage: (msg: MessageDto) => void;

    loadOlderMessages: () => Promise<void>;

    setNearBottom: (near: boolean) => void;
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
    
    return {

        activeRoomId: null,

        status: "IDLE",
        error: null,

        meta: EMPTY_META,
        members: [],

        messages: [],
        pendingMessages: [],

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

        ...createAckActions(set, get),
        ...createSessionActions(set, get),

        setActiveChatroom: (roomId) => {
            if (get().activeRoomId === roomId) return;

            get()._abort?.abort();
            get()._flushAckNow(); // acks are forced when changing rooms

            const { epoch, abort } = get()._beginSession(roomId);

            get()._loadSessionData(roomId, epoch, abort);
        },

        clearActiveChatroom: () => {
            get()._abort?.abort();
            get()._flushAckNow();

            set({
                activeRoomId: null,

                status: "IDLE",
                error: null,

                meta: EMPTY_META,
                members: [],
                messages: [],

                nextCursor: 0,

                hasOlderMessages: false,

                loadingOlderMessages: false,

                lastKnownSeq: 0,

                _epoch: get()._epoch + 1
            });
        },

        sendMessage: (content) => {
            const roomId = get().activeRoomId;
            if (roomId == null) return;

            const clientId = crypto.randomUUID();
            const me = useAuthStore.getState().requireUser();

            const pending = {
                roomId,
                actorId: me.userId,
                actorName: me.username,
                kind: "USER",
                status: "SENDING",
                content,
                clientId
            } satisfies PendingUserMessage;

            set((s) => ({
                pendingMessages: [...s.pendingMessages, pending]
            }));

            apiSendMessage(roomId, content, clientId);
        },

        receiveMessage: (msg) => {
            const me = useAuthStore.getState().requireUser();

            set((s) => {
                const lastKnownSeq = Math.max(s.lastKnownSeq, msg.seq);

                const pendingMessages =
                    msg.kind === "USER" && msg.actorId === me.userId
                        ? s.pendingMessages.filter(p => p.clientId !== msg.clientId)
                        : s.pendingMessages;

                return {
                    lastKnownSeq,
                    pendingMessages,
                    messages: [...s.messages, msg]
                };
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

                if (!get()._isCurrentSession(roomId, epoch, abort)) return;

                set((cur) => {
                    if (cur.status !== "READY") return {};

                    return {
                        messages: [...page.messages, ...cur.messages],
                        nextCursor: page.nextCursor,
                        hasOlderMessages: page.hasOlder,
                        loadingOlderMessages: false
                    };
                });

            } catch (err: unknown) {
                if (!abort.signal.aborted) {
                    set({ error: errorMessage(err) });
                }

                if (get()._isCurrentSession(roomId, epoch, abort)) {
                    set({ loadingOlderMessages: false });
                }
            }
        }
    };
});
