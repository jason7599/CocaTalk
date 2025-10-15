package com.jason7599.cocatalk.security;

import com.jason7599.cocatalk.exception.UsernameTakenException;
import com.jason7599.cocatalk.user.UserEntity;
import com.jason7599.cocatalk.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // returns user id
    @Transactional
    public Long register(UserRegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UsernameTakenException("Username Taken");
        }

        UserEntity user = new UserEntity(
                request.username(),
                passwordEncoder.encode(request.password())
        );

        return userRepository.save(user).getId();
    }

    // returns jwt token
    public String login(UserLoginRequest request) {
        UserEntity user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Bad Credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Bad Credentials");
        }

        return jwtService.generateToken(user.getId(), user.getUsername());
    }
}
