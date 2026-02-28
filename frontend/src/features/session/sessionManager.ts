import api from "../../services/api";
import type { UserBootstrapDto } from "../../shared/types";
import { useContactsStore } from "../contacts/contactsStore";

let bootstrapping = false;

export const sessionManager = {

    async bootstrap() {
        if (bootstrapping) return;
        bootstrapping = true;

        try {
            const res = (await api.get<UserBootstrapDto>("/me/bootstrap")).data;

            useContactsStore.getState().hydrate(res.contacts);
            // useChatroomsStore.getState().hydrate(res.chatroomSummaries);
            // useBlockedUsersStore.getState().hydrate(res.blockedUsers);
        } finally {
            bootstrapping = false;
        }
    },

    clearSession() {
        useContactsStore.getState().reset();

        // useChatroomsStore.getState().reset();
        // useBlockedUsersStore.getState().reset();
    },
};