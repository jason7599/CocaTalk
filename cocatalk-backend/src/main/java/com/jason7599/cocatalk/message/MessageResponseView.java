package com.jason7599.cocatalk.message;

import java.sql.Timestamp;

public interface MessageResponseView {
    Long getRoomId();
    Long getSeqNo();
    Long getUserId();
    String getContent();
    Timestamp getCreatedAt();
}
