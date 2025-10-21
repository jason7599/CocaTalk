package com.jason7599.cocatalk.chatroom;

import java.sql.Timestamp;

// Only exists because sql cannot auto-map TIMESTAMP columns to Instant types
public interface ChatroomSummaryView {
    Long getId();
    String getName();
    String getLastMessage();
    Timestamp getLastMessageAt();
}
