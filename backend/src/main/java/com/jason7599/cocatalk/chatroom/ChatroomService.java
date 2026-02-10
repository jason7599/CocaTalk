package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessagePage;
import com.jason7599.cocatalk.message.MessageRepository;
import com.jason7599.cocatalk.message.MessageResponse;
import com.jason7599.cocatalk.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatroomService {

    // TODO? Maybe later move this to a dedicated const file
    public static final int MEMBER_NAME_PREVIEW_LIMIT = 3;

    private final ChatroomRepository chatroomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public void addUserToRoom(Long userId, Long roomId) {
        chatroomRepository.addUserToRoom(roomId, userId);
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
                row.getLastMessageAt().toInstant(),
                row.getLastSeq(),
                row.getMyLastAck(),
                roomMemberNames.getOrDefault(row.getId(), List.of()),
                roomMemberCount.getOrDefault(row.getId(), 0),
                row.getCreatedAt().toInstant()
        )).toList();
    }

    public Long getMyLastAck(Long roomId, Long userId) {
        return chatroomRepository.getMyLastAck(roomId, userId);
    }

    @Transactional
    public void setMyLastAck(Long roomId, Long userId, Long ack) {
        chatroomRepository.setMyLastAck(roomId, userId, ack);
    }

    @Transactional
    public ChatroomSummary getOrCreateDirectChatroom(Long myId, Long otherId) {
        Optional<ChatroomEntity> chatroomOpt = chatroomRepository.findDirectChatroom(myId, otherId);
        if (chatroomOpt.isPresent()) {
            ChatroomEntity chatroom = chatroomOpt.get();

            return new ChatroomSummary(
                    chatroom.getId(),
                    chatroom.getType(),
                    chatroomRepository.getAlias(chatroom.getId(), myId),
                    chatroomRepository.getLastMessage(chatroom.getId()),
                    chatroom.getLastMessageAt(),
                    chatroom.getLastSeq(),
                    chatroomRepository.getMyLastAck(chatroom.getId(), myId),
                    List.of(userRepository.findById(otherId).orElseThrow().getUsername()),
                    1,
                    chatroom.getCreatedAt()
            );
        }

        ChatroomEntity chatroom = chatroomRepository.save(new ChatroomEntity(ChatroomType.DIRECT));

        chatroomRepository.setDirectChatroom(chatroom.getId(), myId, otherId);

        chatroomRepository.addUserToRoom(chatroom.getId(), myId);
        chatroomRepository.addUserToRoom(chatroom.getId(), otherId);

        return new ChatroomSummary(
                chatroom.getId(),
                ChatroomType.DIRECT,
                null,
                null,
                null,
                0L,
                0L,
                List.of(userRepository.findById(otherId).orElseThrow().getUsername()),
                1,
                chatroom.getCreatedAt()
        );
    }

    public Set<Long> getMemberIds(Long roomId) {
        return chatroomRepository.getMembersId(roomId);
    }

    public MessagePage loadMessages(Long roomId, Long cursor, int limit) {

        // Query intentionally modifies the actual limit to :limit + 1
        // So that we know there are more items if this result's size is greater than the limit param
        List<MessageResponse> messages = messageRepository.loadMessages(roomId, cursor == null ? Long.MAX_VALUE : cursor, limit)
                .stream().map((v) -> new MessageResponse(
                        v.getRoomId(),
                        v.getUserId(),
                        v.getSeqNo(),
                        v.getContent(),
                        v.getCreatedAt().toInstant()
                )).collect(Collectors.toCollection(ArrayList::new)); // collect to ArrayList so it is modifiable

        if (messages.isEmpty()) {
            return new MessagePage(
                    List.of(),
                    null,
                    false
            );
        }

        boolean hasMore = messages.size() > limit;
        if (hasMore) {
            messages.removeFirst();
        }

        return new MessagePage(
                messages,
                hasMore ? messages.getFirst().seqNo() : null,
                hasMore
        );
    }

    public List<ChatMemberInfo> getMembersInfo(Long roomId) {
        return chatroomRepository.loadMemberInfos(roomId)
                .stream().map(v -> new ChatMemberInfo(
                        v.getId(),
                        v.getUsername(),
                        v.getJoinedAt().toInstant()
                )).toList();
    }
}
