export interface UserInfo {
    id: number;
    username: string;
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
}

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
    memberNamesPreview: string[];
    totalMemberCount: number;
    myLastAck: number;
    lastMessage: MessageSummary | null;
};

export interface UserBootstrapDto {
    chatroomSummaries: ChatroomSummary[];
    contacts: UserInfo[];
    blockedUsers: UserInfo[];
};