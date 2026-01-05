import type { FriendRequestSentResult, ReceivedFriendRequest, SentFriendRequest, UserInfo } from "../types";
import api from "./api";

export async function sendFriendRequest(receiverName: string): Promise<FriendRequestSentResult> {
    return (await api.post('/friends/requests', {receiverName})).data;
}

export async function listReceivedRequests(): Promise<ReceivedFriendRequest[]> {
    return (await api.get('/friends/requests/incoming')).data;
}

export async function listSentRequests(): Promise<SentFriendRequest[]> {
    return (await api.get('/friends/requests/outgoing')).data;
}

export async function acceptFriendRequest(senderId: number): Promise<UserInfo> {
    return (await api.post(`/friends/requests/${senderId}/accept`)).data
}

export async function declineFriendRequest(senderId: number): Promise<void> {
    await api.delete(`/friends/requests/incoming/${senderId}`);
}

export async function cancelFriendRequest(receiverId: number): Promise<void> {
    await api.delete(`/friends/requests/outgoing/${receiverId}`);
}

export async function listFriends(): Promise<UserInfo[]> {
    return (await api.get('/friends')).data;
}

export async function removeFriend(friendId: number): Promise<void> {
    await api.delete(`/friends/${friendId}`);
}