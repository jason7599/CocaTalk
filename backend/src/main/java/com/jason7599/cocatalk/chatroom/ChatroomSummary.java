package com.jason7599.cocatalk.chatroom;

import com.fasterxml.jackson.databind.JsonNode;
import com.jason7599.cocatalk.message.EventMessageType;
import com.jason7599.cocatalk.message.MessageDto;
import com.jason7599.cocatalk.message.MessageKind;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Lightweight representation of a chatroom used for rendering the chatroom list in the sidebar panel.
 * This DTO is delivered to the client in 2 situations:
 * 1. During user bootstrap ater login (batch-fetched for all chatrooms)
 * 2. Via WebSocket events when the user's chatroom list should change
 *  (e.g., direct chat created, group created, invited to group)
 */
public record ChatroomSummary(
    Long roomId,
    ChatroomType roomType,
    List<String> memberNamesPreview,
    int totalMemberCount,
    Long myLastAck,
    MessageDto lastMessage
) {
    public interface Projection {
        Long getRoomId();
        ChatroomType getRoomType();
        int getTotalMemberCount();
        Long getMyLastAck();
        Long getLastSeq();
        MessageKind getLastMessageKind();
        EventMessageType getLastMessageEventType();
        Long getLastActorId();
        String getLastActorName();
        String getLastMessage();
        JsonNode getLastEventData();
        Instant getLastMessageAt();
        UUID getLastMessageClientId();
    }
}
