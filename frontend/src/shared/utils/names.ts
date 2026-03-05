import type { UserInfo } from "../types";

export function deriveChatroomName(
    myId: number,
    members: UserInfo[],
    totalMemberCount: number
): string {

    let res = memberNamesPreview.join(", ");
    if (otherMemberCount > memberNamesPreview.length) {
        res += ` and ${otherMemberCount - memberNamesPreview.length} more`;
    }

    return res;
}

export function getChatroomDisplayName(myId: number, room: ChatroomSummary): string {
    return room.alias ?? deriveChatroomName(myId, room.memberInfosPreview, room.totalMemberCount);
}