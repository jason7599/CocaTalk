package com.jason7599.cocatalk.friendship;

import java.sql.Timestamp;

public interface FriendRequestView {
    Long getId();
    String getUsername();
    Timestamp getSentAt();
}
