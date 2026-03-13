import type { ChatroomSummary, EventMessage, MessageDto } from "../../../shared/types";

export function getChatroomDisplayName(chatroom: ChatroomSummary): string {
    const previewNames = chatroom.membersPreview.map(m => m.username);

    // total other members excluding the viewer
    const remaining =
        chatroom.totalMemberCount - previewNames.length - 1;

    const base = previewNames.join(", ");

    if (remaining > 0) {
        return `${base} and ${remaining} more`;
    }

    return base;
};

export function formatLastMessage(message: MessageDto): string {
    switch (message.kind) {
        case "USER":
            return `${message.actorName}: ${message.content}`;

        case "EVENT":
            return formatEventMessage(message);

        default:
            return "";
    }
}

function formatEventMessage(message: EventMessage): string {
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
}