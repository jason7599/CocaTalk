package com.jason7599.cocatalk.friendship;

import com.jason7599.cocatalk.user.UserInfo;

public record FriendRequestSuccessDto(
        UserInfo friendInfo,
        FriendRequestSuccessType type
) {
}
