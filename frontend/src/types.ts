export type ChatroomType = "DIRECT" | "GROUP";

export interface ChatroomSummary {
    id: number;
    type: ChatroomType;
    alias: string | null;
    lastMessage: string | null;
    lastMessageAt: string;
    createdAt: string;
    memberNamesPreview: string[];
    otherMemberCount: number;
};

export interface PendingRequest {
    senderId: number;
    senderName: string;
    sentAt: string;
};

export interface UserInfo {
    id: number;
    username: string;
};

export type FriendRequestSuccessType = "SENT" | "AUTO_ACCEPT";

export interface FriendRequestSuccessDto {
    friendInfo: UserInfo;
    type: FriendRequestSuccessType;
}

export interface MessageRequest {
    content: string;
};

export interface MessageResponse {
    roomId: number;
    senderId: number;
    seqNo: number;
    content: string;
    createdAt: string;
};

export interface DirectChatroomRequest {
    otherUserId: number;
};

export interface MessagePage {
    messages: MessageResponse[];
    nextCursor: number | null;
    hasMore: boolean;
};

export type ChatMemberRole = "MEMBER" | "OWNER" | "ADMIN";

export interface ChatMemberInfo {
    id: number;
    username: string | null;
    role: ChatMemberRole;
    joinedAt: string;
};