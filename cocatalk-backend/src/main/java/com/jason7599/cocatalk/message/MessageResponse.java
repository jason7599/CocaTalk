package com.jason7599.cocatalk.message;

import java.time.Instant;

public record MessageResponse(
        Long roomId,
        Long seqNo,
        String senderName,
        String content,
        Instant createdAt
) {
}
