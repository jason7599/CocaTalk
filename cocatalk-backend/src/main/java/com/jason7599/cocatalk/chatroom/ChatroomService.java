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
        // TODO: No idea why, but DB-side default for the chatroom name
        // TODO: does not seem to apply automatically..
        ChatroomEntity chatroom = chatroomRepository.saveAndFlush(
                new ChatroomEntity(
                        userId,
                        request.name() == null ? "Unnamed Room" : request.name()
                ));

        addUserToRoom(userId, chatroom.getId());

        return new ChatroomSummary(
                chatroom.getId(),
                chatroom.getName(),
                null,
                Instant.now()
        );
    }

    public void addUserToRoom(Long userId, Long roomId) {
        chatroomRepository.addUserToRoom(userId, roomId);
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
