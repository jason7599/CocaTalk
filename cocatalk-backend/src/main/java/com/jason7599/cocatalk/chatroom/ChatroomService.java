package com.jason7599.cocatalk.chatroom;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.text.html.Option;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatroomService {

    private final ChatroomRepository chatroomRepository;

    public void addUserToRoom(Long userId, Long roomId, ChatMemberRole role) {
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

    public List<ChatMemberInfo> getMembersInfo(Long roomId) {
        return chatroomRepository.getMembersInfo(roomId)
                .stream().map(v -> new ChatMemberInfo(
                        v.getId(),
                        v.getName(),
                        v.getRole(),
                        v.getJoinedAt().toInstant()
                )).toList();
    }

    public Long getMyLastAck(Long roomId, Long userId) {
        return chatroomRepository.getMyLastAck(roomId, userId);
    }

    @Transactional
    public ChatroomDetail getOrCreateDirectChatroom(Long myId, Long otherId) {
        Optional<ChatroomEntity> chatroomOpt = chatroomRepository.findDirectChatroom(myId, otherId);
        if (chatroomOpt.isPresent()) {
            ChatroomEntity chatroom = chatroomOpt.get();

            return new ChatroomDetail(
                    chatroom.getId(),
                    chatroom.getName(),
                    chatroom.getType(), // should always be DIRECT, duh
                    getMembersInfo(chatroom.getId()),
                    getMyLastAck(chatroom.getId(), myId),
                    chatroom.getCreatedAt()
            );
        }

        ChatroomEntity chatroom = new ChatroomEntity(

        );
    }
}
