import type { ChatroomSummary, RoomMemberInfo } from "../types";

export function deriveChatroomName(
    myId: number,
    memberInfosPreview: RoomMemberInfo[],
    totalMemberCount: number
): string {
    const otherMemberCount = totalMemberCount - 1;

    if (otherMemberCount === 0) {
        return "Empty Chatroom";
    }

    const memberNamesPreview = memberInfosPreview.filter(
        m => m.userId !== myId
    ).map(m => m.username);

    let res = memberNamesPreview.join(", ");
    if (otherMemberCount > memberNamesPreview.length) {
        res += ` and ${otherMemberCount - memberNamesPreview.length} more`;
    }

    return res;
}

export function getChatroomDisplayName(myId: number, room: ChatroomSummary): string {
    return room.alias ?? deriveChatroomName(myId, room.memberInfosPreview, room.totalMemberCount);
}