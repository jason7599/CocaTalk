import api from "./api";

export async function loadChatrooms() {
    const res = await api.get('/chatrooms');
    return res.data;
};

export async function createRoom(name: string) {
    const res = await api.post('/chatrooms/create', { name });
    return res.data;
}