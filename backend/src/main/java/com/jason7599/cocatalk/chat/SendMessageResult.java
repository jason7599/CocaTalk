package com.jason7599.cocatalk.chat;

import com.jason7599.cocatalk.message.MessageResponse;

public record SendMessageResult(
    Long roomId,
    MessageResponse message,
    boolean directRoomCreated
) {
}
