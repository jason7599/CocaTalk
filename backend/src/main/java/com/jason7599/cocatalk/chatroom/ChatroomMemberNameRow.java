package com.jason7599.cocatalk.chatroom;

/**
 * Used for batch fetching room members
 */
public record ChatroomMemberNameRow(
        long roomId,
        String username
) {
}
