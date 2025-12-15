import type { ChatroomSummary } from "../types";

export function deriveChatroomName(
    memberNamesPreview: string[],
    totalMemberCount: number
): string {
    if (totalMemberCount === 0) {
        return "Empty Chat";
    }

    let res = memberNamesPreview.join(", ");
    if (totalMemberCount > memberNamesPreview.length) {
        res += ` and ${totalMemberCount - memberNamesPreview.length} more`;
    }

    return res;
}

export function getChatroomDisplayName(room: ChatroomSummary): string {
    return room.alias ?? deriveChatroomName(room.memberNamesPreview, room.totalMemberCount);
}