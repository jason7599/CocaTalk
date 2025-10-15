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
    public ChatroomResponse createRoom(Long userId, ChatroomCreateRequest request) {
        ChatroomEntity chatroom = chatroomRepository.save(
                new ChatroomEntity(
                        userId,
                        request.name()
                ));

        return new ChatroomResponse(
                chatroom.getId(),
                chatroom.getName(),
                null,
                null,
                Instant.now(),
                1
        );
    }

    public List<Long> loadChatroomIds(Long userId) {
        return chatroomRepository.loadUserChatroomIds(userId);
    }
}
