export interface UserInfo {
    userId: number;
    username: string;
};

export interface UserBootstrapDto {
    chatroomSummaries: ChatroomSummary[];
    contacts: UserInfo[];
    blockedUsers: UserInfo[];
};


interface BaseMessage {
    roomId: number;
    seq: number;
    actorId: number;
    createdAt: string;
};

export type UserMessage = BaseMessage & {
    kind: "USER";
    senderName: string;
    content: string;
};

export type EventMessageType =
    | "GROUP_CREATED"
    | "MEMBER_JOINED"
    | "MEMBER_LEFT"
    | "MEMBER_REMOVED";
    
export type EventMessage = BaseMessage & {
    kind: "EVENT";
    eventType: EventMessageType;
    eventData: Record<string, unknown>;
};

export type MessageDto = UserMessage | EventMessage;


export type ChatroomType = "DIRECT" | "GROUP";

export interface ChatroomSummary {
    roomId: number;
    roomType: ChatroomType;
    membersPreview: UserInfo[];
    totalMemberCount: number;
    myLastAck: number;
    lastMessage: MessageDto;
};

export type ChatroomMeta =
    | {
        type: "DIRECT";
        blockedByOtherUser: boolean;
    }
    | {
        type: "GROUP";
        groupCreatorId: number;
    }
;

export const EMPTY_META: ChatroomMeta = {
    type: "DIRECT",
    blockedByOtherUser: true
};

export interface ChatroomBootstrapDto {
    meta: ChatroomMeta;
    members: UserInfo[]; // includes self
    // todo: initial message page
};