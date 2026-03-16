import api from "../../services/apiClient";
import type { UserBootstrapDto } from "../../shared/types";
import { useChatroomsStore } from "../chat/chatroomsStore";
import { useContactsStore } from "../contacts/contactsStore";
import { useBlockedUsersStore } from "../userblock/blockedUsersStore";

let bootstrapping = false;

export const sessionManager = {

    async bootstrap() {
        if (bootstrapping) return;
        bootstrapping = true;

        try {
            const res = (await api.get<UserBootstrapDto>("/users/me/bootstrap")).data;
            useChatroomsStore.getState().hydrate(res.chatroomSummaries);
            useContactsStore.getState().hydrate(res.contacts);
            useBlockedUsersStore.getState().hydrate(res.blockedUsers);
        } finally {
            bootstrapping = false;
        }
    },

    clearSession() {
        useChatroomsStore.getState().reset();
        useContactsStore.getState().reset();
        useBlockedUsersStore.getState().reset();
    },
};