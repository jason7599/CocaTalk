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
        // because addUserToRoom requires a query to said chatroom
        ChatroomEntity chatroom = chatroomRepository.saveAndFlush(
                new ChatroomEntity(
                        userId,
                        request.name()
                ));

        addUserToRoom(userId, chatroom.getId());

        // TODO: No idea why, but DB-side default for the chatroom name
        // TODO: does not seem to apply automatically..
        return new ChatroomResponse(
                chatroom.getId(),
                chatroom.getName() == null ? "Unnamed Room" : chatroom.getName(),
                null,
                null,
                Instant.now(),
                1
        );
    }

    public void addUserToRoom(Long userId, Long roomId) {
        chatroomRepository.addUserToRoom(userId, roomId);
    }

    public List<Long> loadChatroomIds(Long userId) {
        return chatroomRepository.loadUserChatroomIds(userId);
    }
}
