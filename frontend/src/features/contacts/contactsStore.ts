import { create } from "zustand";
import type { UserInfo } from "../../shared/types";

type ContactsState = {
    contacts: Record<number, UserInfo>;

    error: string | null;

    // UI state mutations
    hydrate: (contacts: UserInfo[]) => void;
    upsert: (contact: UserInfo) => void;
    removeLocal: (contactId: number) => void;
    reset: () => void;

    // API actions
    addContact: (contactId: number) => Promise<void>;
    removeContact: (contactId: number) => Promise<void>;

    // Selectors
    isContact: (userId: number) => boolean;
};

export const useContactsStore = create<ContactsState>((set, get) => ({
    contacts: {},
    error: null,

    // UI state mutations
    hydrate: (contacts) => {
        set({
            contacts: Object.fromEntries(contacts.map((c) => [c.id, c]))
        });
    },

    upsert: (contact) => {
        set((state) => ({
            contacts: {
                ...state.contacts,
                [contact.id]: contact
            }
        }));
    },

    removeLocal: (contactId) => {
        set((state) => {
            const next = { ...state.contacts };
            delete next[contactId];
            return { contacts: next };
        });
    },

    reset: () => {
        set({
            contacts: {},
            error: null
        });
    },

    // API actions
    addContact: async (contactId) => {

    },

    removeContact: async (contactId) => {

    },

    // Selectors
    isContact: (userId) => {
        return userId in get().contacts;
    }
}));