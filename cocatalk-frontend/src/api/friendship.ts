import api from "./api";

export async function sendFriendRequest(receiverName: string) {
    try {
        await api.post('/friends/request', {receiverName});
    } catch (err: any) {
        throw new Error(err.response.data)
    }
}