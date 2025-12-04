import type { PendingRequest, UserInfo } from "../types";
import api from "./api";

export async function sendFriendRequest(receiverName: string) {
    await api.post('/friends/requests', {receiverName});
}

export async function countPendingRequests() {
    return (await api.get<number>('/friends/requests/count')).data;
}

export async function listPendingRequests() {
    return (await api.get<PendingRequest[]>('/friends/requests')).data;
}

export async function acceptFriendRequest(senderId: number) {
    return (await api.post<UserInfo>(`/friends/requests/${senderId}/accept`)).data
}

export async function removeFriendRequest(senderId: number) {
    await api.delete(`/friends/requests/${senderId}`);
}

export async function listFriends() {
    return (await api.get<UserInfo[]>('/friends')).data;
}