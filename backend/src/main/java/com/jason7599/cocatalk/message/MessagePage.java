package com.jason7599.cocatalk.message;

import java.util.List;

public record MessagePage(
        List<MessageDto> messages,
        long nextCursor, // 0 if there are no more older messages
        boolean hasOlder
) {

    public static MessagePage empty() {
        return new MessagePage(
                List.of(),
                0,
                false
        );
    }
}
