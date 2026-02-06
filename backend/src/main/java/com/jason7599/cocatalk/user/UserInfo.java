package com.jason7599.cocatalk.user;

public record UserInfo(
        Long id,
        String username,
        String tag
) {
    public UserInfo(UserEntity e) {
        this(e.getId(), e.getUsername(), e.getTag());
    }
}
