import type { ChatroomSummary, UserInfo } from "../types";

export function getUserDisplayName(user: UserInfo): string {
    return user.username + '#' + user.tag;
}

export function deriveChatroomName(
    memberNamesPreview: string[],
    otherMemberCount: number
): string {
    if (otherMemberCount === 0) {
        return "Empty Chat";
    }

    let res = memberNamesPreview.join(", ");
    if (otherMemberCount > memberNamesPreview.length) {
        res += ` and ${otherMemberCount - memberNamesPreview.length} more`;
    }

    return res;
}

export function getChatroomDisplayName(room: ChatroomSummary): string {
    return room.alias ?? deriveChatroomName(room.memberNamesPreview, room.otherMemberCount);
}