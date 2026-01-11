import { create } from "zustand";
import type { ChatroomSummary, MessagePreview } from "../types";
import { getOrCreateDirectChatroom, loadChatrooms } from "../api/chatrooms";

type ChatroomsState = {
    chatrooms: ChatroomSummary[];

    loading: boolean;
    error: string | null;

    // "reducers" (pure-ish)
    setAll: (rooms: ChatroomSummary[]) => void;
    upsert: (room: ChatroomSummary) => void;
    remove: (roomId: number) => void;

    setMyLastAck: (roomId: number, ackSeq: number) => void;

    // "commands" (async, call API then reducers)
    fetch: () => Promise<void>;
    openDirectChatroom: (otherUserId: number) => Promise<ChatroomSummary | null>;

    // WS reducer
    onNewMessage: (preview: MessagePreview) => void;
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

    setAll: (rooms) => set({ chatrooms: sortByLastMessageAtDesc(rooms) }),

    upsert: (room) =>
        set((s) => {
            const exists = s.chatrooms.some((r) => r.id === room.id);
            const merged = exists ? s.chatrooms : [room, ...s.chatrooms];
            return { chatrooms: sortByLastMessageAtDesc(merged) };
        }),

    remove: (roomId) =>
        set((s) => ({
            chatrooms: s.chatrooms.filter((r) => r.id !== roomId),
        })),

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
            get().setAll(data);
        } catch (err: any) {
            console.error(err);
            set({ error: err.message ?? "Failed to load chatrooms" });
        } finally {
            set({ loading: false });
        }
    },

    openDirectChatroom: async (otherUserId: number) => {
        set({ loading: true, error: null });
        try {
            const room = await getOrCreateDirectChatroom({ otherUserId });
            get().upsert(room);
            return room; // let UI decide what to do (select it, navigate, etc.)
        } catch (err: any) {
            set({ error: err.message ?? "Failed to open direct chatroom" });
            return null;
        } finally {
            set({ loading: false });
        }
    },

    onNewMessage: (preview) =>
        set((s) => {
            const idx = s.chatrooms.findIndex((r) => r.id === preview.roomId);
            if (idx === -1) {
                console.warn(`[chatroomsStore.onNewMessage] room of ${preview.roomId} not found!`); // shouldn't happen...
                return s; // no-op
            }

            const room = s.chatrooms[idx];

            const updated: ChatroomSummary = {
                ...room,
                lastSeq: preview.seqNo,
                lastMessage: preview.contentPreview,
                lastMessageAt: preview.createdAt,
            };

            const next = [...s.chatrooms];
            next[idx] = updated;

            return { chatrooms: sortByLastMessageAtDesc(next) };
        }),
}));
