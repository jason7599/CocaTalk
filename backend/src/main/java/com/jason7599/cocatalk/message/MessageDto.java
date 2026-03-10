package com.jason7599.cocatalk.message;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;

public record MessageDto(
        Long roomId,
        Long seq,
        MessageKind kind,
        EventMessageType eventType,
        Long actorId,
        String actorName,
        String content,
        JsonNode eventData,
        Instant createdAt
) {
}
