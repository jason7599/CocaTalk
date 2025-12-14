package com.jason7599.cocatalk.chatroom;

import java.time.Instant;
import java.util.List;

public record ChatroomDetail(
        Long id,
        String name,
        ChatroomType type,
        List<ChatMemberInfo> members,
        Long myLastAck,
        Instant createdAt
) {
}
