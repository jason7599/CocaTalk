package com.jason7599.cocatalk.security;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserRegisterRequest(
        @Email
        @NotBlank
        String email,

        @Size(min = 3, max = 25)
        @Pattern(
                regexp = "^[a-zA-Z0-9_.]+$",
                message = "Username can only contain letters, numbers, underscores, and dots"
        )
        String username,

        @NotBlank
        String password
) {
}
