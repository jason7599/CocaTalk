package com.jason7599.cocatalk.chatroom;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
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
                .stream().map(row -> {
                    Long roomId = ((Number) row[0]).longValue();
                    String roomName = (String) row[1];
                    String lastMessage = (String) row[2];
                    Instant lastMessageAt = ((Timestamp) row[3]).toInstant();

                    return new ChatroomSummary(
                            roomId,
                            roomName,
                            lastMessage,
                            lastMessageAt
                    );
                }).toList();
    }
}
