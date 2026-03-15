export interface UserInfo {
    userId: number;
    username: string;
};

export interface UserBootstrapDto {
    chatroomSummaries: ChatroomSummary[];
    contacts: UserInfo[];
    blockedUsers: UserInfo[];
};


// Common fields for all message types 
type MessageBase = {
    roomId: number;
    actorId: number;
    actorName: string;
};

// For both pending & persisted user message
// Only user messages, not event messages
type UserMessageBase = MessageBase & {
    kind: "USER";
    content: string;
};

type PendingUserMessage = UserMessageBase & {
    status: "SENDING" | "FAILED";
    clientId: string; // TODO
};

type PersistedMessageBase = MessageBase & {
    status: "SENT";
    seq: number;
    createdAt: string;
};

export type UserMessage = PendingUserMessage 
    | (PersistedMessageBase & UserMessageBase)
;

export type EventMessageType =
    | "GROUP_CREATED"
    | "MEMBER_JOINED"
    | "MEMBER_LEFT"
    | "MEMBER_REMOVED"
;

export type EventMessage = PersistedMessageBase & {
    kind: "EVENT";
    eventType: EventMessageType; 
    eventData: Record<string, unknown>;
};

// distinguish using kind
export type MessageDto = UserMessage | EventMessage;

export interface MessagePage {
    messages: MessageDto[];
    startSeq: number;
    endSeq: number;
    hasOlder: boolean;
};


export type ChatroomType = "DIRECT" | "GROUP";

export interface ChatroomSummary {
    roomId: number;
    roomType: ChatroomType;
    memberNamesPreview: string[];
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
    blockedByOtherUser: false
};

export interface ChatroomBootstrapDto {
    meta: ChatroomMeta;
    members: UserInfo[]; // excludes self
    initialPage: MessagePage;
    lastReadSeq: number;
    lastSeq: number;
};