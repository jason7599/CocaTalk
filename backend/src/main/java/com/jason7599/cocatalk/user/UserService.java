package com.jason7599.cocatalk.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserInfo getUserInfo(Long userId) {
        return new UserInfo(userRepository.findById(userId).orElseThrow());
    }
}
