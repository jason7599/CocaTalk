package com.jason7599.cocatalk.message;

import java.time.Instant;

public record MessagePreview(
    Long roomId,
    Long seqNo,
    String senderName,
    String contentPreview,
    Instant createdAt
) {
}
