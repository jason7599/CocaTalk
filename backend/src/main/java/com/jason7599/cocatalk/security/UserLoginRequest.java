package com.jason7599.cocatalk.security;

public record UserLoginRequest(
        String email,
        String password
) {
}
