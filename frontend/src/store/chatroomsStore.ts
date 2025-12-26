import { create } from "zustand";
import type { ChatroomSummary } from "../types";
import { getOrCreateDirectChatroom, loadChatrooms } from "../api/chatrooms";

type ChatroomsState = {
    chatrooms: ChatroomSummary[];

    activeRoomId: number | null;

    loading: boolean;
    error: string | null;

    // "reducers" (pure-ish)
    setAll: (rooms: ChatroomSummary[]) => void;
    upsert: (room: ChatroomSummary) => void;
    update: (roomId: number, updates: Partial<ChatroomSummary>) => void;
    remove: (roomId: number) => void;

    setActiveRoomId: (roomId: number | null) => void;

    // "commands" (async, call API then reducers)
    fetch: () => Promise<void>;
    openDirectChatroom: (otherUserId: number) => Promise<ChatroomSummary | null>;

    // "WS reducer" (called by websocket notification handler)
    applyRoomActivity: (room: ChatroomSummary) => void;
};

function sortByLastMessageAtDesc(rooms: ChatroomSummary[]) {
    return [...rooms].sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
}

export const useChatroomsStore = create<ChatroomsState>((set, get) => ({
    chatrooms: [],
    activeRoomId: null,
    loading: false,
    error: null,

    setAll: (rooms) => set({ chatrooms: sortByLastMessageAtDesc(rooms) }),

    upsert: (room) =>
        set((s) => {
            const exists = s.chatrooms.some((r) => r.id === room.id);
            const merged = exists ? s.chatrooms : [room, ...s.chatrooms];
            return { chatrooms: sortByLastMessageAtDesc(merged) };
        }),

    update: (roomId, updates) =>
        set((s) => ({
            chatrooms: sortByLastMessageAtDesc(
                s.chatrooms.map((r) => (r.id === roomId ? { ...r, ...updates } : r))
            ),
        })),

    remove: (roomId) =>
        set((s) => ({
            chatrooms: s.chatrooms.filter((r) => r.id !== roomId),
        })),

    setActiveRoomId: (roomId: number | null) => {
        // console.log(`setActiveRoomId(${roomId})`);
        set({activeRoomId: roomId});
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

    // WS reducer
    applyRoomActivity: (room) => {
        // When a notification says "this room changed", we upsert + sort.
        get().upsert(room);
    },
}));
