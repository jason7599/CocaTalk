package com.jason7599.cocatalk.chatroom;

import java.sql.Timestamp;

public interface RoomMemberInfoView {
    Long getRoomId();
    Long getUserId();
    String getUsername();
    String getTag();
    Timestamp getJoinedAt();
}
