package com.jason7599.cocatalk.friendship;

import com.jason7599.cocatalk.user.UserInfo;

public record FriendRequestSentResult(
        FriendRequestSentResultType type,
        SentFriendRequestDto request,
        UserInfo friendInfo
) {
}
