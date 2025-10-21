import api from "./api";

export async function loadChatrooms() {
    const res = await api.get('/chatrooms');
    return res.data;
};