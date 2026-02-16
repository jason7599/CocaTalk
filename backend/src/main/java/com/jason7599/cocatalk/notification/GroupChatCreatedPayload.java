package com.jason7599.cocatalk.notification;

import com.jason7599.cocatalk.chatroom.RoomMemberInfo;

import java.time.Instant;
import java.util.List;

public record GroupChatCreatedPayload(
        Long roomId,
        Long groupCreatorId,
        List<RoomMemberInfo> memberInfosPreview,
        int totalMemberCount,
        Instant createdAt
) implements UserNotificationPayload {
}
