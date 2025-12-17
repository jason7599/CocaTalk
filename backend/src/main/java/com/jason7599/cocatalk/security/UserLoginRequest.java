package com.jason7599.cocatalk.security;

public record UserLoginRequest(
        String username,
        String password
) {
}
