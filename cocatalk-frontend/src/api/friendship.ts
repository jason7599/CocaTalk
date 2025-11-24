import api from "./api";

export async function sendFriendRequest(receiverName: string) {
    await api.post('/friends/requests', {receiverName});
}

export async function countPendingRequests() {
    const res = await api.get<number>('/friends/requests/count');
    return res.data;
}