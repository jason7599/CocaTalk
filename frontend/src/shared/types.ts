export interface UserInfo {
    userId: number;
    username: string;
};

export interface UserBootstrapDto {
    chatroomSummaries: ChatroomSummary[];
    contacts: UserInfo[];
    blockedUsers: UserInfo[];
};


/**
 * Common base for ALL messages.
 * Regardless of kind or persistence
 */
type MessageBase = {
    roomId: number;
    actorId: number;
    actorName: string;
};

/**
 * "Dto" refers to the fact that it comes straight from the DB
 * Meaning it is persisted
 */
type MessageDtoBase = MessageBase & {
    seq: number;
    createdAt: string;
};

type UserMessageDto = MessageDtoBase & {
    kind: "USER";
    content: string;
    clientId: string;
};

export type EventMessageType =
    | "GROUP_CREATED"
    | "MEMBER_JOINED"
    | "MEMBER_LEFT"
    | "MEMBER_REMOVED"
;

type EventMessageDto = MessageDtoBase & {
    kind: "EVENT";
    eventType: EventMessageType;
    eventData: Record<string, unknown>;
};

/**
 * This is an exact match of the BE shape.
 * The expected shape from the message loading APIs
 */
export type MessageDto = UserMessageDto | EventMessageDto;

// UI state
export type PendingUserMessage = MessageBase & {
    kind: "USER";
    status: "SENDING" | "FAILED";
    content: string;
    clientId: string;
};

export type MessageInfo = (MessageDto & { status: "PERSISTED" }) | PendingUserMessage;

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