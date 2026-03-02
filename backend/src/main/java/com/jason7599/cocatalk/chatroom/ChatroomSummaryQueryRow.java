package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.EventMessageType;
import com.jason7599.cocatalk.message.MessageKind;

import java.time.Instant;

/**
 * Intermediate DTO for initial chatroom query
 * Unlike the real ChatroomSummary DTO,
 * this DTO does not include the list of member names.
 */
public interface ChatroomSummaryQueryRow {
    Long getRoomId();
    ChatroomType getRoomType();
    int getTotalMemberCount();
    Long getMyLastAck();
    Long getLastSeq();
    MessageKind getLastMessageKind();
    EventMessageType getLastMessageEventType();
    String getLastSenderName();
    String getLastMessage();
    Instant getLastMessageAt();
}
