package com.jason7599.cocatalk.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserRegisterRequest(
        @NotBlank(message = "Username cannot be blank")
        @Size(min = 3, max = 25, message = "Username length must be between 3 and 25")
        @Pattern(
                regexp = "^[a-zA-Z0-9_.]+$",
                message = "Username can only contain letters, numbers, underscores, and dots"
        )
        String username,

        @NotBlank(message = "Password cannot be blank")
        String password
) {
}
