package com.jason7599.cocatalk.friendship;

import java.time.Instant;

public record SentFriendRequestDto(
        Long receiverId,
        String receiverName,
        Instant sentAt
) {
}
