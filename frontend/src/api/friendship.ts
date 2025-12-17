import type { FriendRequestSuccessDto, PendingRequest, UserInfo } from "../types";
import api from "./api";

export async function sendFriendRequest(receiverName: string): Promise<FriendRequestSuccessDto> {
    return (await api.post('/friends/requests', {receiverName})).data;
}

export async function countPendingRequests(): Promise<number> {
    return (await api.get('/friends/requests/count')).data;
}

export async function listPendingRequests(): Promise<PendingRequest[]> {
    return (await api.get('/friends/requests')).data;
}

export async function acceptFriendRequest(senderId: number): Promise<UserInfo> {
    return (await api.post(`/friends/requests/${senderId}/accept`)).data
}

export async function removeFriendRequest(senderId: number): Promise<void> {
    await api.delete(`/friends/requests/${senderId}`);
}

export async function listFriends(): Promise<UserInfo[]> {
    return (await api.get('/friends')).data;
}

export async function removeFriend(friendId: number): Promise<void> {
    await api.delete(`/friends/${friendId}`);
}