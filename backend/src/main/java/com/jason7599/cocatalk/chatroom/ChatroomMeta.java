package com.jason7599.cocatalk.chatroom;

/**
 * Metadata describing properties of a chatroom that affect how the client should behave when the room is opened
 */
public record ChatroomMeta(
        ChatroomType type,
        Long groupCreatorId, // only for group chats
        boolean blockedByOtherUser // only for direct, whether the other user has blocked me
) {
}
