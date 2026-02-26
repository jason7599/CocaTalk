package com.jason7599.cocatalk.message;

import java.time.Instant;

public record MessageSummary(
    Long seq,
    MessageKind kind,
    EventMessageType eventType,
    String senderName,
    String content,
    Instant createdAt
) {
}
