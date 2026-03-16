package com.jason7599.cocatalk.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record SendMessageRequest(
        @NotBlank(message = "Message cannot be blank")
        @Size(max = MessageEntity.MAX_CONTENT_LENGTH, message = "Message cannot exceed length " + MessageEntity.MAX_CONTENT_LENGTH)
        String content,

        UUID clientId
) {
}
