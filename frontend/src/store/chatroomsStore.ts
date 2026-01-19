import { create } from "zustand";
import type { ChatroomSummary, MessagePreview } from "../types";
import { getOrCreateDirectChatroom, loadChatrooms } from "../api/chatrooms";

type ChatroomsState = {
    chatrooms: ChatroomSummary[];

    loading: boolean;
    error: string | null;

    // bootstrap + pending queue
    // Whether this store has completed the state load from the DB,
    // And is ready to safely reconcile incremental updates
    bootstrapped: boolean;
    pendingPreviews: Record<number, MessagePreview>;

    // "reducers" (pure-ish)
    putChatroom: (room: ChatroomSummary) => void;
    removeChatroom: (roomId: number) => void;

    setMyLastAck: (roomId: number, ackSeq: number) => void;

    // "commands" (async, call API then reducers)
    fetch: () => Promise<void>;
    openDirectChatroom: (otherUserId: number) => Promise<ChatroomSummary | null>;

    // WS reducer
    onNewMessage: (preview: MessagePreview) => void;

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
    bootstrapped: false,
    pendingPreviews: {},

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
                bootstrapped: true
            });

            get()._flushPendingPreviews();
        } catch (err: any) {
            console.error(err);
            set({ error: err.message ?? "Failed to load chatrooms" });
        } finally {
            set({ loading: false });
        }
    },

    openDirectChatroom: async (otherUserId: number) => {
        const room = await getOrCreateDirectChatroom({ otherUserId });
        get().putChatroom(room);
        return room; // let UI decide what to do (select it, navigate, etc.)
    },

    onNewMessage: (preview) => {
        set((s) => {
            // buffer preview if we haven't loaded rooms yet
            if (!s.bootstrapped) {
                const existing = s.pendingPreviews[preview.roomId];
                if (!existing || existing.seqNo < preview.seqNo) {
                    return {
                        pendingPreviews: {
                            ...s.pendingPreviews,
                            [preview.roomId]: preview
                        }
                    };
                }
                return s;
            }


            const idx = s.chatrooms.findIndex((r) => r.id === preview.roomId);
            if (idx === -1) {
                console.warn(`[chatroomsStore.onNewMessage] room of ${preview.roomId} not found!`); // shouldn't happen...
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
                lastMessage: preview.contentPreview,
                lastMessageAt: preview.createdAt,
            };

            const next = [...s.chatrooms];
            next[idx] = updated;

            return { chatrooms: sortByLastMessageAtDesc(next) };
        })
    },

    _flushPendingPreviews: () => {
        if (!get().bootstrapped) throw new Error("flushPendingPreviews called before bootstrapped");

        set((s) => {
            // dumb fuckery because stupidass Record types don't support a size API
            // so this loop is basically semantically irrelevant
            for (const _ in s.pendingPreviews) {
                // found one key -> not empty
                const nextRooms = s.chatrooms.map((room) => {
                    const p = s.pendingPreviews[room.id];
                    if (!p) return room;
                    if (room.lastSeq >= p.seqNo) return room;

                    return {
                        ...room,
                        lastSeq: p.seqNo,
                        lastMessage: p.contentPreview,
                        lastMessageAt: p.createdAt,
                    };
                });

                return {
                    chatrooms: sortByLastMessageAtDesc(nextRooms),
                    pendingPreviews: {},
                };
            }

            return s; // was empty -> no-op
        });
    },
}))
