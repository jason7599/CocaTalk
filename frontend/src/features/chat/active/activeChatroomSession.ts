import type { StoreApi } from "zustand";
import type { ActiveChatroomState } from "./activeChatroomStore";
import { EMPTY_META } from "../../../shared/types";
import { errorMessage } from "../../../shared/utils/errors";
import { apiChatroomBootstrap } from "../chatroomApi";

export type SessionActions = {
    setActiveChatroom: (roomId: number) => void;
    clearActiveChatroom: () => void;

    _beginSession: (roomId: number) => { epoch: number; abort: AbortController };
    _isCurrentSession: (roomId: number, epoch: number, abort: AbortController) => boolean;
    _loadSessionData: (roomId: number, epoch: number, abort: AbortController) => Promise<void>;
};

export function createSessionActions(
    set: StoreApi<ActiveChatroomState>["setState"],
    get: StoreApi<ActiveChatroomState>["getState"]
): SessionActions {

    return {
        /**
         * Sets the activeRoomId, and starts a new room transaction by:
         * 1. Incrementing the _epoch, invalidates previous requests
         * 2. Create a new abort controller
         * 3. Reset room related state
        */
        _beginSession: (roomId) => {
            const nextEpoch = get()._epoch + 1;
            const abort = new AbortController();

            set({
                activeRoomId: roomId,

                status: "LOADING",
                error: null,

                meta: EMPTY_META,
                members: [],

                messages: [],
                pendingMessages: [],

                nextCursor: 0,
                hasOlderMessages: false,

                loadingOlderMessages: false,

                lastKnownSeq: 0,

                _abort: abort,
                _epoch: nextEpoch,

                isNearBottom: true,
                _ackTimer: null,
                _pendingAck: 0,
                _lastSentAck: 0,
            });

            return { epoch: nextEpoch, abort };
        },

        _isCurrentSession: (roomId, epoch, abort) => {
            if (abort.signal.aborted) return false;
            const s = get();
            return s.activeRoomId === roomId && s._epoch === epoch;
        },

        _loadSessionData: async (roomId: number, epoch, abort) => {
            try {
                const bootstrapData = await apiChatroomBootstrap(roomId);

                if (!get()._isCurrentSession(roomId, epoch, abort)) return;

                const page = bootstrapData.initialPage;

                set({
                    status: "READY",
                    meta: bootstrapData.meta,
                    members: bootstrapData.members,

                    messages: page.messages,
                    nextCursor: page.nextCursor,
                    hasOlderMessages: page.hasOlder,

                    loadingOlderMessages: false,

                    lastKnownSeq: 0,
                });

                // same behavior as before
                get()._maybeAckLatestVisible();

            } catch (err: unknown) {
                if (!get()._isCurrentSession(roomId, epoch, abort)) return;

                set({
                    status: "ERROR",
                    error: errorMessage(err),
                });
            }
        },

        setActiveChatroom: (roomId) => {
            if (get().activeRoomId === roomId) return;

            get()._abort?.abort();
            get()._flushAckNow();

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

                _epoch: get()._epoch + 1,
            });
        },
    };
}