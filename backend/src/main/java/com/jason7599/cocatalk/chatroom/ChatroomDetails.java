package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.user.UserInfo;

import java.util.List;

/**
 * Whereas ChatroomSummary is mainly a preview for the sidebar,
 * ChatroomDetails holds sufficient information to populate the
 * chat screen, minus the list of messages.
 */
public record ChatroomDetails(
        Long roomId,
        ChatroomType type,
        List<UserInfo> members, // does not include the requester
        Long groupCreatorId, // only for group chats
        boolean blockedByOtherUser // only for direct, whether the other user has blocked me
) {
}
