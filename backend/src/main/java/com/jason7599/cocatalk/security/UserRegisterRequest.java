package com.jason7599.cocatalk.security;

public record UserRegisterRequest(
        String email,
        String username,
        String password
) {
}
