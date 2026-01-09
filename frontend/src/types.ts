export type ChatroomType = "DIRECT" | "GROUP";

export interface ChatroomSummary {
    id: number;
    type: ChatroomType;
    alias: string | null;
    lastMessage: string | null;
    lastMessageAt: string;
    lastSeq: number;
    myLastAck: number;
    memberNamesPreview: string[];
    otherMemberCount: number;
    createdAt: string;
};

export interface ReceivedFriendRequest {
    senderId: number;
    senderName: string;
    sentAt: string;
};

export interface SentFriendRequest {
    receiverId: number;
    receiverName: number;
    sentAt: string;
};

export interface UserInfo {
    id: number;
    username: string;
};

export type FriendRequestSentResultType = "SENT" | "AUTO_ACCEPT";

export interface FriendRequestSentResult {
    type: FriendRequestSentResultType;
    request: SentFriendRequest | null;
    friendInfo: UserInfo;
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

export interface MessagePreview {
    roomId: number;
    senderName: string;
    contentPreview: string;
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