package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.chatroom.ChatroomService;
import com.jason7599.cocatalk.user.relation.UserRelationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserBootstrapService {

    private final ChatroomService chatroomService;
    private final UserRelationService userRelationService;

    // "because semantically, bootstrap() is NOT user domain behavior"
    public UserBootstrapDto bootstrap(Long userId) {
        return new UserBootstrapDto(
                chatroomService.getChatroomSummaries(userId),
                userRelationService.getContacts(userId),
                userRelationService.getBlockedUsers(userId)
        );
    }
}
