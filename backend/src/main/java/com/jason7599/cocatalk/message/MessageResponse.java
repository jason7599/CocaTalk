package com.jason7599.cocatalk.message;

import java.time.Instant;

public record MessageResponse(
        Long roomId,
        Long senderId,
        Long seqNo,
        String content,
        Instant createdAt
) {
}
