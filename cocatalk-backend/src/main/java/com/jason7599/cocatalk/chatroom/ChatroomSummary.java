package com.jason7599.cocatalk.chatroom;

import java.time.Instant;

public record ChatroomSummary(
        Long id,
        String name,
        String lastMessage,
        Instant lastMessageAt
) {
}
