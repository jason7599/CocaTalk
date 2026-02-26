package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessageSummary;

import java.util.List;

/**
 * DTO to be sent to the FE to populate the sidebar.
 */
public record ChatroomSummary(
    Long roomId,
    ChatroomType type,
    List<String> memberNamesPreview,
    int totalMemberCount,
    Long myLastAck,
    MessageSummary lastMessage
) {
}
