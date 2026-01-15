import { create } from "zustand";
import type { UserInfo } from "../types";
import {
    addContact as apiAddContact,
    listContacts as apiListContacts,
    removeContact as apiRemoveContact,
} from "../api/contacts";

type ContactsState = {
    contacts: UserInfo[];

    loading: boolean;

    error: string | null;

    fetch: () => Promise<void>;
    addContact: (username: string) => Promise<void>;
    removeContact: (contactId: number) => Promise<void>;
    clearError: () => void;
};

export const useContactsStore = create<ContactsState>((set, get) => ({
    contacts: [],
    loading: false,
    error: null,

    fetch: async () => {
        set({ loading: true, error: null });
        try {
            const data = await apiListContacts();
            set({ contacts: data });
        } catch (err: any) {
            set({ error: err.message });
        } finally {
            set({ loading: false });
        }
    },

    addContact: async (username: string) => {
        set({ error: null });
        try {
            const created = await apiAddContact(username);

            set((s) => {
                if (s.contacts.some((c) => c.id === created.id)) return s;
                return {
                    contacts: [...s.contacts, created].sort((a, b) =>
                        a.username.localeCompare(b.username)
                    )
                };
            })
        } catch (err: any) {
            set({ error: err.message });
            throw err;
        }
    },

    removeContact: async (contactId: number) => {
        set({ error: null });
        try {
            await apiRemoveContact(contactId);
            set((s) => ({ contacts: s.contacts.filter((c) => c.id !== contactId) }));
        } catch (err: any) {
            set({ error: err.message });
            throw err; // optional
        }
    },

    clearError: () => set({error: null})
}));