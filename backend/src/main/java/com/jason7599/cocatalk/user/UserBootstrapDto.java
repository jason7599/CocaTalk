package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.chatroom.ChatroomSummary;

import java.util.List;

public record UserBootstrapDto(
        UserInfo authUser,
        List<ChatroomSummary> chatroomSummaries,
        List<UserInfo> contacts,
        List<UserInfo> blockedUsers
) {
}
