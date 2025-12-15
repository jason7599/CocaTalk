package com.jason7599.cocatalk.chatroom;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatroomService {

    // TODO? Maybe later move this to a dedicated const file
    public static final int MEMBER_NAME_PREVIEW_LIMIT = 3;

    private final ChatroomRepository chatroomRepository;

    public void addUserToRoom(Long userId, Long roomId, ChatMemberRole role) {
        chatroomRepository.addUserToRoom(userId, roomId, role);
    }

    public List<ChatroomSummary> loadChatroomSummaries(Long userId) {

        // 1. Basic fetch
        List<ChatroomSummaryRow> rows = chatroomRepository.fetchChatroomSummaries(userId);

        // 2. Extract ids for batch fetch
        Long[] roomIds = rows.stream()
                .map(ChatroomSummaryRow::getId)
                .toArray(Long[]::new);

        // 3. Batch fetch member names per room
        List<ChatMemberNameRow> memberNameRows = chatroomRepository.fetchChatMemberNamesExcept(roomIds, userId);

        // 4. Collect member names & member count for each room
        Map<Long, List<String>> roomMemberNames = new HashMap<>(); // don't include me
        Map<Long, Integer> roomMemberCount = new HashMap<>();      // also don't include me

        for (ChatMemberNameRow row : memberNameRows) {
            Long roomId = row.getRoomId();

            roomMemberCount.merge(roomId, 1, Integer::sum);

            List<String> names = roomMemberNames.computeIfAbsent(
                    roomId, k -> new ArrayList<>(MEMBER_NAME_PREVIEW_LIMIT));

            if (names.size() < MEMBER_NAME_PREVIEW_LIMIT) {
                names.add(row.getUsername());
            }
        }

        // 5. Map and return final DTO.
        return rows.stream().map(row -> new ChatroomSummary(
                row.getId(),
                row.getType(),
                row.getAlias(),
                row.getLastMessage(),
                row.getLastMessageAt() != null ? row.getLastMessageAt().toInstant() : null,
                roomMemberNames.getOrDefault(row.getId(), List.of()),
                roomMemberCount.getOrDefault(row.getId(), 0)
        )).toList();
    }

    public Long getMyLastAck(Long roomId, Long userId) {
        return chatroomRepository.getMyLastAck(roomId, userId);
    }

//    @Transactional
//    public ChatroomDetail getOrCreateDirectChatroom(Long myId, Long otherId) {
//        Optional<ChatroomEntity> chatroomOpt = chatroomRepository.findDirectChatroom(myId, otherId);
//        if (chatroomOpt.isPresent()) {
//            ChatroomEntity chatroom = chatroomOpt.get();
//
//            return new ChatroomDetail(
//                    chatroom.getId(),
//                    chatroom.getType(), // should always be DIRECT, duh
//                    getMembersInfo(chatroom.getId()),
//                    getMyLastAck(chatroom.getId(), myId),
//                    chatroom.getCreatedAt()
//            );
//        }
//
//        ChatroomEntity chatroom = new ChatroomEntity(
//
//        );
//    }
}
