package com.jason7599.cocatalk.message;

import java.util.List;

public record MessagePage(
        List<MessageDto> messages,
        Long startSeq, // first in this window
        Long endSeq, // last in this window
        boolean hasOlder
) {

    public static MessagePage empty() {
        return new MessagePage(
                List.of(),
                null,
                null,
                false
        );
    }
}
