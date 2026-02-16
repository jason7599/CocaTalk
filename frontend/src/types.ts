export type ChatroomType = "DIRECT" | "GROUP";

export interface ChatroomSummary {
    id: number;
    type: ChatroomType;
    otherUserId: number | null;
    groupCreatorId: number | null;
    alias: string | null;
    lastMessage: string | null;
    lastMessageAt: string;
    lastSeq: number;
    myLastAck: number;
    memberInfosPreview: RoomMemberInfo[];
    totalMemberCount: number;
    createdAt: string;
};

export interface UserInfo {
    id: number;
    username: string;
    tag: string;
};

export interface MessageRequest {
    content: string;
};

export interface MessageResponse {
    senderId: number;
    seqNo: number;
    content: string;
    createdAt: string;
};

export interface DirectChatroomRequest {
    otherUserId: number;
};

export interface CreateGroupChatRequest {
    memberIds: number[];
};

export interface MessagePage {
    messages: MessageResponse[];
    nextCursor: number | null;
    hasMore: boolean;
};

export interface RoomMemberInfo {
    roomId: number;
    userId: number;
    username: string | null;
    tag: string | null;
    joinedAt: string;
};

export const USER_NOTIFICATION_TYPES = {
    DIRECT_CHAT_CREATED: "DIRECT_CHAT_CREATED",
    MESSAGE_PREVIEW: "MESSAGE_PREVIEW",
    GROUP_CHAT_CREATED: "GROUP_CHAT_CREATED",
} as const;

export type UserNotificationType = 
    typeof USER_NOTIFICATION_TYPES[keyof typeof USER_NOTIFICATION_TYPES];

export interface DirectChatCreatedPayload {
    senderId: number;
    otherUserId: number;
    createdRoomId: number;
    content: string;
    senderName: string;
    otherUserName: string;
    createdAt: string;
};

export interface MessagePreviewPayload {
    roomId: number;
    seqNo: number;
    senderName: string;
    content: string;
    createdAt: string;
};

export interface GroupChatCreatedPayload {
    roomId: number;
    groupCreatorId: number;
    memberInfosPreview: RoomMemberInfo[];
    totalMemberCount: number;
    createdAt: string;
};

interface UserNotificationPayloadMap {
    DIRECT_CHAT_CREATED: DirectChatCreatedPayload;
    MESSAGE_PREVIEW: MessagePreviewPayload;
    GROUP_CHAT_CREATED: GroupChatCreatedPayload;
};

export type UserNotification = {
    [K in keyof UserNotificationPayloadMap]: {
        type: K;
        payload: UserNotificationPayloadMap[K];
    };
}[keyof UserNotificationPayloadMap];