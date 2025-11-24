import api from "./api";

export async function sendFriendRequest(receiverName: string) {
    await api.post('/friends/requests', {receiverName});
}

export async function countPendingRequests() {
    return await api.get('/friends/requests/count');
}