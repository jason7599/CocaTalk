package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.chatroom.ChatroomService;
import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.user.relation.UserRelationRepository;
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
    private final ChatroomService chatroomService;
    private final UserRelationRepository userRelationRepository;

    public UserInfo getUserInfo(Long userId) {
        return new UserInfo(
                userRepository.findById(userId)
                        .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Invalid userId"))
        );
    }

    public UserBootstrapDto bootstrap(Long userId) {
        return new UserBootstrapDto(
                chatroomService.getChatroomSummaries(userId),
                userRelationRepository.getContacts(userId),
                userRelationRepository.getBlockedUsers(userId) // Do we really need this?
        );
    }

    public List<UserInfo> searchUsers(String query, Long viewerId) {
        // defensive
        if (query.length() < USER_QUERY_STRING_MIN_LENGTH) {
            return List.of();
        }
        return userRepository.searchUsers(query, viewerId, USER_QUERY_RESULT_LIMIT);
    }
}
