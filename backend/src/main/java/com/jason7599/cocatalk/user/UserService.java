package com.jason7599.cocatalk.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private static final int SEARCH_LIMIT = 10;

    public UserInfo getUserInfo(Long userId) {
        return new UserInfo(userRepository.findById(userId).orElseThrow());
    }

    public List<UserInfo> searchByDiscriminator(String discriminator) {
        return userRepository.searchByDiscriminator(discriminator, SEARCH_LIMIT)
                .stream().map(UserInfo::new).toList();
    }
}
