import type { PendingRequest, UserInfo } from "../types";
import api from "./api";

export async function sendFriendRequest(receiverName: string) {
    await api.post('/friends/requests', {receiverName});
}

export async function countPendingRequests() {
    const res = await api.get<number>('/friends/requests/count');
    return res.data;
}

export async function listPendingRequests() {
    const res = await api.get<PendingRequest[]>('/friends/requests');
    return res.data;
}

export async function acceptFriendRequest(senderId: number) {
    const res = await api.post<UserInfo>(`/friends/requests/${senderId}/accept`);
    return res.data;
}

export async function removeFriendRequest(senderId: number) {
    await api.delete(`/friends/requests/${senderId}`);
}