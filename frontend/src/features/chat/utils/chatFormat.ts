import type { ChatroomSummary, EventMessageDto, MessageDto, UserInfo } from "../../../shared/types";

export function formatChatroomDisplayNameFromSummary(chatroom: ChatroomSummary): string {
    return formatChatroomDisplayName(
        chatroom.membersPreview.map(m => m.username),
        chatroom.totalMemberCount
    );
}

export function formatChatroomDisplayNameFromMembers(members: UserInfo[]): string {
    return formatChatroomDisplayName(
        members.map(m => m.username),
        members.length + 1 // since this excludes user
    );
}

function formatChatroomDisplayName(memberNames: string[], totalMemberCount: number): string {
    if (memberNames.length === 0) {
        return "Empty chat";
    }

    const sorted = [...memberNames].sort((a, b) =>
        a.localeCompare(b)
    );

    const preview = sorted.slice(0, 4);
    const base = preview.join(", ");

    const remaining =
        totalMemberCount - preview.length - 1; // minus viewer

    if (remaining > 0) {
        return `${base} and ${remaining} more`;
    }

    return base;
}

export function formatLastMessage(message: MessageDto): string {
    switch (message.kind) {
        case "USER":
            return `${message.actorName}: ${message.content}`;
        case "EVENT":
            return formatEventMessage(message);
        default:
            return "";
    }
};

export function formatEventMessage(message: EventMessageDto): string {
    switch (message.eventType) {
        case "GROUP_CREATED":
            return `${message.actorName} created the group`;

        case "MEMBER_JOINED": {
            const username = message.eventData["username"] as string | undefined;
            return username
                ? `${username} joined the group`
                : "A member joined the group";
        }

        case "MEMBER_LEFT": {
            const username = message.eventData["username"] as string | undefined;
            return username
                ? `${username} left the group`
                : "A member left the group";
        }

        case "MEMBER_REMOVED": {
            const username = message.eventData["username"] as string | undefined;
            return username
                ? `${username} was removed from the group`
                : "A member was removed from the group";
        }

        default:
            return "System event";
    }
};

export function formatTime(time: string): string {
    const d = new Date(time);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};