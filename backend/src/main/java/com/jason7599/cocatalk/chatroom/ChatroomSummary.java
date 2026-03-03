package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessageSummary;

import java.util.List;

/**
 * DTO to be sent to the FE to populate the sidebar.
 * 1. Batch-fetched upon user bootstrap after login
 * 2. WebSocket event when new chatroom is created
 * => (Direct chatroom created, group chatroom created, user invited to group)
 */
public record ChatroomSummary(
    Long roomId,
    List<String> memberNamesPreview,
    int totalMemberCount,
    Long myLastAck,
    MessageSummary lastMessage
) {
}
