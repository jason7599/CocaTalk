package com.jason7599.cocatalk.chatroom;

/**
 * Used for batch fetching room member names
 */
public record ChatroomMemberNameRow(
        Long roomId,
        String username
) {
}
