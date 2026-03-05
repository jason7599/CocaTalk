export interface UserInfo {
    userId: number;
    username: string;
};

export interface UserBootstrapDto {
    chatroomSummaries: ChatroomSummary[];
    contacts: UserInfo[];
    blockedUsers: UserInfo[];
};


export type MessageKind = "USER" | "EVENT";
export type EventMessageType =
    | "GROUP_CREATED"
    | "MEMBER_JOINED"
    | "MEMBER_LEFT"
    | "MEMBER_REMOVED";

interface BaseMessage {
    roomId: number;
    seq: number;
    createdAt: string;
};

export type UserMessage = BaseMessage & {
    kind: "USER";
    eventType: null;
    senderName: string;
    content: string;
};

export type EventMessage = BaseMessage & {
    kind: "EVENT";
    eventType: EventMessageType;
    senderName: null;
    content: null;
};

export type MessageSummary = UserMessage | EventMessage;


export type ChatroomType = "DIRECT" | "GROUP";

export interface ChatroomSummary {
    roomId: number;
    type: ChatroomType;
    membersPreview: UserInfo[];
    totalMemberCount: number;
    myLastAck: number;
    lastMessage: MessageSummary;
};

export type ChatroomDetails =
    | {
        roomId: number;
        type: "DIRECT";
        members: UserInfo[];
        directChatBlocked: boolean;
    }
    | {
        roomId: number;
        type: "GROUP";
        members: UserInfo[];
        groupCreatorId: number;
    }
;
