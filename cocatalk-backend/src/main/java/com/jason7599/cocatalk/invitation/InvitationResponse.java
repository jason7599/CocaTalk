package com.jason7599.cocatalk.invitation;

import java.time.Instant;

public record InvitationResponse(
        Long roomId,
        String roomName,
        Instant invitedAt
) {
}