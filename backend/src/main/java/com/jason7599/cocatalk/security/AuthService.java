package com.jason7599.cocatalk.security;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.user.UserEntity;
import com.jason7599.cocatalk.user.UserRepository;
import com.jason7599.cocatalk.user.UserTagGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
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
        for (int attempt = 0; attempt < 5; attempt++) {
            String tag = UserTagGenerator.generate();
            try {
                UserEntity user = new UserEntity(
                        request.email(),
                        request.username(),
                        tag,
                        passwordEncoder.encode(request.password())
                );
                return userRepository.save(user).getId();
            } catch (DataIntegrityViolationException ex) {
                if (isUsernameTagConflict(ex)) {
                    continue; // tag collision -> retry
                }
                if (isEmailConflict(ex)) {
                    throw new ApiError(HttpStatus.CONFLICT, "Email taken");
                }
                throw ex;
            }
        }

        // really shouldn't happen, probabilistically
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Huh wtf");
    }

    @Transactional
    public void renameUser(Long userId, String username) {
        UserEntity user = userRepository.findById(userId).orElseThrow();
        if (user.getUsername().equals(username)) {
            return;
        }

        for (int attempt = 0; attempt < 5; attempt++) {
            String tag = UserTagGenerator.generate();
            try {
                user.setUsername(username);
                user.setTag(tag);
                userRepository.save(user);
            } catch (DataIntegrityViolationException ex) {
                if (isUsernameTagConflict(ex)) {
                    continue;
                }
                throw ex;
            }
        }

        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Huh wtf");
    }

    private boolean isUsernameTagConflict(DataIntegrityViolationException ex) {
        return ex.getMessage().contains("users_username_tag_unique");
    }

    private boolean isEmailConflict(DataIntegrityViolationException ex) {
        return ex.getMessage().contains("users_email_unique");
    }

    // returns jwt token
    public String login(UserLoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiError(HttpStatus.FORBIDDEN, "Bad Credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Bad Credentials");
        }

        return jwtService.generateToken(user.getId());
    }
}
