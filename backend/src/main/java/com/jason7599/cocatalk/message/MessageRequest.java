package com.jason7599.cocatalk.message;

public record MessageRequest(
        Long roomId, // only in case of existing chatrooms
        Long recipientId, // only in case of dm proxies
        String content
) {
}
