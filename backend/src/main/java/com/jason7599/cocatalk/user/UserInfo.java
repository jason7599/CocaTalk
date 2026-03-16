package com.jason7599.cocatalk.user;

public record UserInfo(
        long userId,
        String username
) {
    public UserInfo(UserEntity e) {
        this(e.getId(), e.getUsername());
    }
}
