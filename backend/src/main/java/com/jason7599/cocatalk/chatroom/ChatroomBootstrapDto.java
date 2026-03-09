package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessagePage;
import com.jason7599.cocatalk.user.UserInfo;

import java.util.List;

public record ChatroomBootstrapDto(
        ChatroomMeta meta,
        List<UserInfo> members,
        MessagePage initialPage,
        Long lastReadSeq, // my previous last ack
        Long lastSeq     // current snapshot of the latest seq
) {
}
