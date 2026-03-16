package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.exception.ApiError;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final int USER_QUERY_RESULT_LIMIT = 20;
    private static final int USER_QUERY_STRING_MIN_LENGTH = 3;

    private final UserRepository userRepository;

    public UserInfo getUserInfo(long userId) {
        return new UserInfo(
                userRepository.findById(userId)
                        .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Invalid userId"))
        );
    }

    public List<UserInfo> searchUsers(String query, long viewerId) {
        // defensive
        if (query.length() < USER_QUERY_STRING_MIN_LENGTH) {
            return List.of();
        }
        return userRepository.searchUsers(query, viewerId, USER_QUERY_RESULT_LIMIT);
    }
}
