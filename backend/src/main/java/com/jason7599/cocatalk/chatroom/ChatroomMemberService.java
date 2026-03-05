package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.user.UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * TODO: later add REDIS
 */
@Service
@RequiredArgsConstructor
public class ChatroomMemberService {

    private final ChatroomRepository chatroomRepository;

    public List<UserInfo> fetchMembers(Long roomId) {
        return chatroomRepository.fetchMembers(roomId);
    }

    public void assertMembership(Long roomId, Long userId) {
        if (!chatroomRepository.isChatroomMember(roomId, userId)) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Not a member of this room");
        }
    }
}
