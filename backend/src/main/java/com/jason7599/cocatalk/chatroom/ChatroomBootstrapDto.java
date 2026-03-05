package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.user.UserInfo;

import java.util.List;

public record ChatroomBootstrapDto(
        ChatroomMeta meta,
        List<UserInfo> members
) {
}
