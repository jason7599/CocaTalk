package com.jason7599.cocatalk.message;

import java.time.Instant;

public record MessagePreview(
    Long roomId,
    String senderName,
    String contentPreview,
    Instant createdAt
) {
}
