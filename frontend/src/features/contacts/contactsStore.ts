import { create } from "zustand";
import type { UserInfo } from "../../shared/types";
import { addContact as apiAddContact, removeContact as apiRemoveContact } from "./contactsApi";

type ContactsState = {
    contacts: Record<number, UserInfo>;
    addingIds: Set<number>;

    // UI state mutations
    hydrate: (contacts: UserInfo[]) => void;
    upsert: (contact: UserInfo) => void;
    removeLocal: (contactId: number) => void;
    reset: () => void;

    // API actions
    addContact: (contactId: number) => Promise<void>;
    removeContact: (contactId: number) => Promise<void>;
};

export const useContactsStore = create<ContactsState>((set, get) => ({
    contacts: {},
    addingIds: new Set<number>(),

    // UI state mutations
    hydrate: (contacts) => {
        set({
            contacts: Object.fromEntries(contacts.map((c) => [c.userId, c]))
        });
    },

    upsert: (contact) => {
        set((state) => ({
            contacts: {
                ...state.contacts,
                [contact.userId]: contact
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
        });
    },

    // API actions
    addContact: async (contactId) => {
        set((state) => {
            const next = new Set(state.addingIds);
            next.add(contactId);
            return { addingIds: next };
        })

        try {
            get().upsert(await apiAddContact(contactId));
        } finally {
            set((state) => {
                const next = new Set(state.addingIds);
                next.delete(contactId);
                return { addingIds: next };
            });
        }
    },

    removeContact: async (contactId) => {
        await apiRemoveContact(contactId);
        get().removeLocal(contactId);
    },
}));