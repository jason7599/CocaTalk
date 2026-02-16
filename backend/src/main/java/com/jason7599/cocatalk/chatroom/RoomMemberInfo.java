package com.jason7599.cocatalk.chatroom;

import java.time.Instant;

public record RoomMemberInfo(
        Long roomId,
        Long userId,
        String username,
        String tag,
        Instant joinedAt
) {
}
