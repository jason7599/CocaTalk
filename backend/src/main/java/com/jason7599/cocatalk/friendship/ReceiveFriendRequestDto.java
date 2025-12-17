package com.jason7599.cocatalk.friendship;

import java.time.Instant;

public record ReceiveFriendRequestDto(
        Long senderId,
        String senderName,
        Instant sentAt
) {
}
