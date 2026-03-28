package com.jason7599.cocatalk.message;

import com.jason7599.cocatalk.message.event.EventData;
import com.jason7599.cocatalk.message.event.EventMessageType;

import java.time.Instant;
import java.util.UUID;

public record MessageDto(
        long roomId,
        long seq,
        MessageKind kind,
        EventMessageType eventType,
        long actorId,
        String actorName,
        String content,
        EventData eventData,
        Instant createdAt,
        UUID clientId
) {
    public interface Projection {
        long getRoomId();
        long getSeq();
        MessageKind getKind();
        EventMessageType getEventType();
        long getActorId();
        String getActorName();
        String getContent();
        String getEventData();
        Instant getCreatedAt();
        UUID getClientId();
    }
}
