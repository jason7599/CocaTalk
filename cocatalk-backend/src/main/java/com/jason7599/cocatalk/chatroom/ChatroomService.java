package com.jason7599.cocatalk.chatroom;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatroomService {

    private final ChatroomRepository chatroomRepository;

    @Transactional
    public ChatroomSummary createRoom(Long userId, ChatroomCreateRequest request) {

        ChatroomEntity chatroom = chatroomRepository.saveAndFlush(new ChatroomEntity(request.name()));

        addUserToRoom(userId, chatroom.getId(), ChatroomRole.OWNER);

        return new ChatroomSummary(
                chatroom.getId(),
                chatroom.getName(),
                null,
                Instant.now()
        );
    }

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
