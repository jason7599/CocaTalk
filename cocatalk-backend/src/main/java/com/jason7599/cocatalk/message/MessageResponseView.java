package com.jason7599.cocatalk.message;

import java.time.Instant;

public interface MessageResponseView {
    Long getRoomId();
    Long getSeqNo();
    Long getUserId();
    String getContent();
    Instant getCreatedAt();
}
