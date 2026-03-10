package com.jason7599.cocatalk.message;

import java.util.List;

public record MessagePage(
        List<MessageDto> messages,
        long startSeq, // first in this window
        long endSeq, // last in this window
        boolean hasOlder
) {

    public static MessagePage empty() {
        return new MessagePage(
                List.of(),
                0,
                0,
                false
        );
    }
}
