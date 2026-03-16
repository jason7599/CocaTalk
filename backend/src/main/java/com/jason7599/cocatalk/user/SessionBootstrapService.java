package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.chatroom.ChatroomService;
import com.jason7599.cocatalk.user.relation.UserRelationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SessionBootstrapService {

    private final ChatroomService chatroomService;
    private final UserRelationService userRelationService;

    public UserBootstrapDto bootstrap(long userId) {
        return new UserBootstrapDto(
                chatroomService.getChatroomSummaries(userId),
                userRelationService.getContacts(userId),
                userRelationService.getBlockedUsers(userId)
        );
    }
}
