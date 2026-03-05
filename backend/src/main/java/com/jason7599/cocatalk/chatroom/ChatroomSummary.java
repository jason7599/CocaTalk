package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessageDto;
import com.jason7599.cocatalk.user.UserInfo;

import java.util.List;

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
    List<UserInfo> membersPreview,
    int totalMemberCount,
    Long myLastAck,
    MessageDto lastMessage
) {
}
