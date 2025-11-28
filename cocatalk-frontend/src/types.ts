export type ChatroomSummary = {
    id: number;
    name: string;
    lastMessage: string | null;
    lastMessageAt: string | null;
};

export type PendingRequest = {
    senderId: number;
    senderName: string;
    sentAt: string;
};

export type UserInfo = {
    id: number;
    username: string;
};