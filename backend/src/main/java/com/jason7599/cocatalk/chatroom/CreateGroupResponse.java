package com.jason7599.cocatalk.chatroom;

public record CreateGroupResponse(
        long roomId,
        boolean hasSkippedMembers
) {
}
