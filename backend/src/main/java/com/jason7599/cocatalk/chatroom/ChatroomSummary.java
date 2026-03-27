package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessageDto;
import com.jason7599.cocatalk.message.MessageKind;
import com.jason7599.cocatalk.message.event.EventMessageType;
import com.jason7599.cocatalk.user.UserInfo;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Lightweight representation of a chatroom used for rendering the chatroom list in the sidebar panel.
 * This DTO is delivered to the client in 2 situations:
 * 1. During user bootstrap after login (batch-fetched for all chatrooms)
 * 2. Via WebSocket events when the user's chatroom list should change
 *  (e.g., direct chat created, group created, invited to group)
 */
public record ChatroomSummary(
    long roomId,
    ChatroomType roomType,
    List<UserInfo> membersPreview,
    int totalMemberCount,
    long myLastAck,
    MessageDto lastMessage
) {
    public interface Projection {
        long getRoomId();
        ChatroomType getRoomType();
        int getTotalMemberCount();
        long getMyLastAck();
        long getLastSeq();
        MessageKind getLastMessageKind();
        EventMessageType getLastMessageEventType();
        long getLastActorId();
        String getLastActorName();
        String getLastMessage();
        String getLastEventData();
        Instant getLastMessageAt();
        UUID getLastMessageClientId();
    }
}
