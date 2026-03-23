package com.jason7599.cocatalk.chatroom;

/**
 * Used for batch fetching room members
 */
public record ChatroomMemberRow(
        long roomId,
        long userId,
        String username
) {
}
