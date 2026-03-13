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
    public interface Projection {
        Long getRoomId();
        Long getSeq();
        String getKind();
        String getEventType();
        Long getActorId();
        String getActorName();
        String getContent();
        JsonNode getEventData();
        Instant getCreatedAt();
    }

    public MessageDto(MessageEntity e) {
        this(
                e.getId().roomId(),
                e.getId().seq(),
                e.getKind(),
                e.getEventType(),
                e.getActorId(),
                e.getActorName(),
                e.getContent(),
                e.getEventData(),
                e.getCreatedAt()
        );
    }

    public MessageDto(Projection p) {
        this(
                p.getRoomId(),
                p.getSeq(),
                p.getKind() == null ? null : MessageKind.valueOf(p.getKind()),
                p.getEventType() == null ? null : EventMessageType.valueOf(p.getEventType()),
                p.getActorId(),
                p.getActorName(),
                p.getContent(),
                p.getEventData(),
                p.getCreatedAt()
        );
    }
}
