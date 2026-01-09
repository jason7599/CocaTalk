package com.jason7599.cocatalk.chatroom;

import java.time.Instant;
import java.util.List;

public record ChatroomSummary(
        Long id,
        ChatroomType type,
        String alias,
        String lastMessage,
        Instant lastMessageAt,
        Long lastSeq,
        Long myLastAck,
        List<String> memberNamesPreview,
        int otherMemberCount,
        Instant createdAt
) {
}
