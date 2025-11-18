package com.jason7599.cocatalk.user;

public record UserInfo(
        Long id,
        String username
) {
    public UserInfo(UserEntity e) {
        this(e.getId(), e.getUsername());
    }
}
