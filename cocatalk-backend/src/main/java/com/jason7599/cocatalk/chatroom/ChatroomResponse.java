package com.jason7599.cocatalk.chatroom;

import java.time.Instant;

public record ChatroomResponse(
        Long id,
        String name,
        String lastMessage,
        String lastSender,
        Instant lastMessageAt,
        int memberCount
) {
}
