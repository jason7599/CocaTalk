package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.chatroom.ChatroomService;
import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.user.relation.UserRelationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

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
                getUserInfo(userId),
                chatroomService.getChatroomSummaries(userId),
                userRelationRepository.getContacts(userId),
                userRelationRepository.getBlockedUsers(userId)
        );
    }
}
