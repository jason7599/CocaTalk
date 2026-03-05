package com.jason7599.cocatalk.message;

import java.util.List;

public record MessagePage(
        List<MessageDto> messages,
        Long nextCursor,
        boolean hasMoreMessages
) {
}
