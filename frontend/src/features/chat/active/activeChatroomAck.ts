import type { StoreApi } from "zustand";
import type { ActiveChatroomState } from "./activeChatroomStore";
import { useChatroomsStore } from "../chatroomsStore";
import { apiUpdateLastAck } from "../chatroomApi";

const ACK_DEBOUNCE_MS = 400;

export type AckActions = {
    ackUpTo: (seq: number) => void
    _scheduleAckFlush: () => void
    _flushAckNow: () => void
    _maybeAckLatestVisible: () => void
};

export function createAckActions(
    set: StoreApi<ActiveChatroomState>["setState"],
    get: StoreApi<ActiveChatroomState>["getState"]
) {
    return {
        ackUpTo: (seq: number) => {
            const s = get();

            if (s.activeRoomId == null) return;
            if (seq <= s._pendingAck) return;

            set({ _pendingAck: seq });

            // schedule debounce flush
            get()._scheduleAckFlush();

            useChatroomsStore.getState().setMyLastAck(s.activeRoomId, seq);
        },

        _maybeAckLatestVisible: () => {
            const s = get();
            
            if (!s.isNearBottom) return;
            if (s.status !== "READY") return;
            if (s.messages.length === 0) return;

            get().ackUpTo(s.messages.at(-1)!.seq);
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
            
            if (pending <= s._lastSentAck) {
                set({ _ackTimer: null });
                return;
            }
            
            apiUpdateLastAck(roomId, pending);
            
            set({
                _lastSentAck: pending,
                _ackTimer: null
            });

            console.log("ACKed", pending);
        },
    }
};