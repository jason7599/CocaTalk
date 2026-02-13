package com.jason7599.cocatalk.notification;

import java.time.Instant;

// fired when user sends a message in a direct chatroom for the first time
public record DirectChatCreatedPayload(
        Long senderId,
        Long otherUserid,
        Long createdRoomId,
        String content,
        String senderName,
        String otherUserName,
        Instant createdAt
) implements UserNotificationPayload {
}
