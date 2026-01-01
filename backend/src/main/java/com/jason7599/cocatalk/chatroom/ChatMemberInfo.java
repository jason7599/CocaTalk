package com.jason7599.cocatalk.chatroom;

import java.time.Instant;

public record ChatMemberInfo(
        Long id,
        String username,
        ChatMemberRole role,
        Instant joinedAt
) {
}
