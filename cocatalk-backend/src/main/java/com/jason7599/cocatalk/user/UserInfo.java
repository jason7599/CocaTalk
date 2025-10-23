package com.jason7599.cocatalk.user;

import java.time.Instant;

public record UserInfo(
        Long id,
        String username
) {
    public UserInfo(UserEntity e) {
        this(e.getId(), e.getUsername());
    }
}
