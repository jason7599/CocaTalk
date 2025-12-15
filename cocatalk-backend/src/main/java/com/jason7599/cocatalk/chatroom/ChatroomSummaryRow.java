package com.jason7599.cocatalk.chatroom;

import java.sql.Timestamp;

// INTERNAL USE
// Used only to assemble ChatroomSummary (the actual DTO to be passed to the FE)
public interface ChatroomSummaryRow {
    Long getId();
    ChatroomType getType();
    String getAlias();
    String getLastMessage();
    Timestamp getLastMessageAt();
}
