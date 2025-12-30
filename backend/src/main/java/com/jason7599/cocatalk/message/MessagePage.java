package com.jason7599.cocatalk.message;

import java.util.List;

public record MessagePage(
        List<MessageResponse> messages,
        Long nextCursor,
        boolean hasMore
) {
}
