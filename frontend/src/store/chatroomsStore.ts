import { create } from "zustand";
import type { ChatroomSummary, MessagePreviewPayload } from "../types";
import { loadChatrooms } from "../api/chatrooms";

/*
Lazy initializing DM rooms.

1. User A clicks on the DM button. This does NOT create a chatroom entity just yet, 
    but just shows A an empty chatroom UI. activeRoomId = null.

2. User B actually sends a message. Now the DB creates a chatroom entity.

3. This emits an event to A's client; type=DM_CREATED, body={senderId=B, chatroomId=id, message=msg}

4. A's client sets the activeRoomId, populates the message list with B's message. 
    This is only done if A is currently looking at an empty DM chatroom with B. 
    So this will require us to store info about with whom the user is looking at an empty DM with, if they are.
*/

type ChatroomsState = {
    chatrooms: ChatroomSummary[];

    loading: boolean;
    error: string | null;

    // bootstrap + pending queue
    // Whether this store has completed the state load from the DB,
    // And is ready to safely reconcile incremental updates
    _bootStrapped: boolean;
    _pendingPreviews: Record<number, MessagePreviewPayload>;

    // "reducers" (pure-ish)
    putChatroom: (room: ChatroomSummary) => void;
    removeChatroom: (roomId: number) => void;

    setMyLastAck: (roomId: number, ackSeq: number) => void;

    // "commands" (async, call API then reducers)
    fetch: () => Promise<void>;
    // WS reducer
    onNewMessagePreview: (preview: MessagePreviewPayload) => void;

    _flushPendingPreviews: () => void;
};

function sortByLastMessageAtDesc(rooms: ChatroomSummary[]) {
    return [...rooms].sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
}

export const useChatroomsStore = create<ChatroomsState>((set, get) => ({
    chatrooms: [],
    loading: false,
    error: null,
    _bootStrapped: false,
    _pendingPreviews: {},

    putChatroom: (room) => {
        set((s) => {
            if (s.chatrooms.some((r) => r.id === room.id)) {
                return s;
            }
            return { chatrooms: sortByLastMessageAtDesc([room, ...s.chatrooms]) };
        })
    },

    removeChatroom: (roomId) => {
        set((s) => ({
            chatrooms: s.chatrooms.filter((r) => r.id !== roomId),
        }))
    },

    setMyLastAck: (roomId, ackSeq) => {
        set((s) => ({
            chatrooms: s.chatrooms.map((r) => r.id === roomId
                ? { ...r, myLastAck: ackSeq }
                : r
            )
        }));
    },

    fetch: async () => {
        set({ loading: true, error: null });
        try {
            const data = await loadChatrooms();

            set({
                chatrooms: sortByLastMessageAtDesc(data),
                _bootStrapped: true
            });

            get()._flushPendingPreviews();
        } catch (err: any) {
            console.error(err);
            set({ error: err.message ?? "Failed to load chatrooms" });
        } finally {
            set({ loading: false });
        }
    },

    onNewMessagePreview: (preview) => {
        set((s) => {
            // buffer preview if we haven't loaded rooms yet
            if (!s._bootStrapped) {
                const existing = s._pendingPreviews[preview.roomId];
                if (!existing || existing.seqNo < preview.seqNo) {
                    return {
                        _pendingPreviews: {
                            ...s._pendingPreviews,
                            [preview.roomId]: preview
                        }
                    };
                }
                return s;
            }

            const idx = s.chatrooms.findIndex((r) => r.id === preview.roomId);
            if (idx === -1) {
                console.warn(`[chatroomsStore.onNewMessage] room of ${preview.roomId} not found!`); 
                // todo: Maybe this can happen if this notif arrives earlier than dm_created
                return s; // no-op
            }

            const room = s.chatrooms[idx];

            // stale
            if (room.lastSeq >= preview.seqNo) {
                return s;
            }

            const updated: ChatroomSummary = {
                ...room,
                lastSeq: preview.seqNo,
                lastMessage: preview.content,
                lastMessageAt: preview.createdAt,
            };

            const next = [...s.chatrooms];
            next[idx] = updated;

            return { chatrooms: sortByLastMessageAtDesc(next) };
        })
    },

    _flushPendingPreviews: () => {
        if (!get()._bootStrapped) throw new Error("flushPendingPreviews called before _bootStrapped");

        set((s) => {
            // dumb fuckery because stupidass Record types don't support a size API
            // so this loop is basically semantically irrelevant
            for (const _ in s._pendingPreviews) {
                // found one key -> not empty
                const nextRooms = s.chatrooms.map((room) => {
                    const p = s._pendingPreviews[room.id];
                    if (!p) return room;
                    if (room.lastSeq >= p.seqNo) return room;

                    return {
                        ...room,
                        lastSeq: p.seqNo,
                        lastMessage: p.content,
                        lastMessageAt: p.createdAt,
                    };
                });

                return {
                    chatrooms: sortByLastMessageAtDesc(nextRooms),
                    _pendingPreviews: {},
                };
            }

            return s; // was empty -> no-op
        });
    },
}))
