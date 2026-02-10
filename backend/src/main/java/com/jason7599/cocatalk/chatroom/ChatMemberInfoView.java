package com.jason7599.cocatalk.chatroom;

import java.sql.Timestamp;

public interface ChatMemberInfoView {
    Long getId();
    String getUsername();
    String getTag();
    Timestamp getJoinedAt();
}
