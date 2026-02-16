package com.jason7599.cocatalk.chatroom;

import java.util.List;

public record CreateGroupChatRequest(
        List<Long> memberIds
) {
}
