package com.jason7599.cocatalk.notification;

import java.time.Instant;

public record MessagePreviewPayload(
        Long roomId,
        Long seqNo,
        String senderName,
        String content,
        Instant createdAt
) implements UserNotificationPayload {
}
