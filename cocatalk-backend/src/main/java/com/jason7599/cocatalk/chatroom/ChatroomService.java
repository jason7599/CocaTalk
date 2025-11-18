package com.jason7599.cocatalk.chatroom;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatroomService {

    private final ChatroomRepository chatroomRepository;

    public void addUserToRoom(Long userId, Long roomId, ChatroomRole role) {
        chatroomRepository.addUserToRoom(userId, roomId, role);
    }

    public List<ChatroomSummary> loadChatroomSummaries(Long userId) {
        return chatroomRepository.loadUserChatroomSummaries(userId)
                .stream().map(v -> new ChatroomSummary(
                        v.getId(),
                        v.getName(),
                        v.getLastMessage(),
                        v.getLastMessageAt().toInstant()
                )).toList();
    }
}
