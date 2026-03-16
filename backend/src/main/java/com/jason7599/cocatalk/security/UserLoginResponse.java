package com.jason7599.cocatalk.security;

import com.jason7599.cocatalk.user.UserInfo;

public record UserLoginResponse(
        String token,
        UserInfo user
) {
}
