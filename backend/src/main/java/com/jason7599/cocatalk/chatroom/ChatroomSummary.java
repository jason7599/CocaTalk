package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessageSummary;
import com.jason7599.cocatalk.user.UserInfo;

import java.util.List;

/**
 * DTO to be sent to the FE to populate the sidebar.
 * 1. Batch-fetched upon user bootstrap after login
 * 2. WebSocket event when new chatroom is created
 * => (Direct chatroom created, group chatroom created, user invited to group)
 */
public record ChatroomSummary(
    Long roomId,
    ChatroomType type,
    List<UserInfo> membersPreview,
    int totalMemberCount,
    Long myLastAck,
    MessageSummary lastMessage
) {
}
