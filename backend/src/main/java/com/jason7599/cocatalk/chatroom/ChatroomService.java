package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessagePage;
import com.jason7599.cocatalk.message.MessageRepository;
import com.jason7599.cocatalk.message.MessageResponse;
import com.jason7599.cocatalk.notification.UserNotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatroomService {

    // TODO? Maybe later move this to a dedicated const file
    public static final int MEMBER_INFO_PREVIEW_LIMIT = 5;

    private final ChatroomRepository chatroomRepository;
    private final MessageRepository messageRepository;
    private final UserNotificationService userNotificationService;

    public boolean isChatroomMember(Long roomId, Long userId) {
        return chatroomRepository.isChatroomMember(roomId, userId);
    }

    @Transactional
    public ChatroomEntity addDirectChatroom(Long userId, Long otherId) {
        Optional<ChatroomEntity> opt = chatroomRepository.findDirectChatroom(userId, otherId);
        if (opt.isPresent()) {
            return opt.get();
        }

        ChatroomEntity chatroom = chatroomRepository.save(ChatroomEntity.directChatroom());
        chatroomRepository.setDirectChatroom(chatroom.getId(), userId, otherId);
        chatroomRepository.addUserToRoom(chatroom.getId(), userId);
        chatroomRepository.addUserToRoom(chatroom.getId(), otherId);

        return chatroom;
    }

    @Transactional
    public ChatroomSummary createGroupChat(Long creatorId, List<Long> memberIds) {
        ChatroomEntity chatroom = chatroomRepository.save(ChatroomEntity.groupChatroom(creatorId));
        memberIds.add(creatorId);

        chatroomRepository.addUsersToRoom(chatroom.getId(), memberIds.toArray(Long[]::new));

        List<RoomMemberInfo> roomMemberInfosPreview = chatroomRepository.fetchMemberInfosPreview(memberIds, MEMBER_INFO_PREVIEW_LIMIT)
                .stream().map(v -> new RoomMemberInfo(
                        v.getRoomId(),
                        v.getUserId(),
                        v.getUsername(),
                        v.getTag(),
                        v.getJoinedAt().toInstant()
                )).toList();

        userNotificationService.dispatchGroupChatCreated(
                chatroom.getId(),
                creatorId,
                roomMemberInfosPreview,
                memberIds.size()
        );

        return new ChatroomSummary(
                chatroom.getId(),
                ChatroomType.GROUP,
                null,
                creatorId,
                null,
                null,
                Instant.now(),
                0L,
                0L,
                roomMemberInfosPreview,
                memberIds.size(),
                Instant.now()
        );
    }

    public List<ChatroomSummary> loadChatroomSummaries(Long userId) {

        // 1. Basic fetch
        List<ChatroomSummaryRow> rows = chatroomRepository.fetchChatroomSummaries(userId);

        // 2. Extract ids for batch fetch
        Long[] roomIds = rows.stream()
                .map(ChatroomSummaryRow::getId)
                .toArray(Long[]::new);

        // 3. Batch fetch member infos per room
        List<RoomMemberInfoView> memberInfoViews = chatroomRepository.batchFetchChatMemberInfos(roomIds, MEMBER_INFO_PREVIEW_LIMIT);

        // 4. Collect member names & member count for each room
        Map<Long, List<RoomMemberInfo>> roomMemberInfos = new HashMap<>();
        Map<Long, Integer> roomMemberCount = new HashMap<>();

        for (RoomMemberInfoView view : memberInfoViews) {
            Long roomId = view.getRoomId();

            roomMemberCount.merge(roomId, 1, Integer::sum);

            List<RoomMemberInfo> memberInfos = roomMemberInfos.computeIfAbsent(
                    roomId, k -> new ArrayList<>(MEMBER_INFO_PREVIEW_LIMIT));

            memberInfos.add(new RoomMemberInfo(
                    roomId,
                    view.getUserId(),
                    view.getUsername(),
                    view.getTag(),
                    view.getJoinedAt().toInstant()
            ));
        }

        // 5. Map and return final DTO.
        return rows.stream().map(row -> new ChatroomSummary(
                row.getId(),
                row.getType(),
                row.getOtherUserId(),
                row.getGroupCreatorId(),
                row.getAlias(),
                row.getLastMessage(),
                row.getLastMessageAt().toInstant(),
                row.getLastSeq(),
                row.getMyLastAck(),
                roomMemberInfos.getOrDefault(row.getId(), List.of()),
                roomMemberCount.getOrDefault(row.getId(), 0),
                row.getCreatedAt().toInstant()
        )).toList();
    }

    @Transactional
    public void setMyLastAck(Long roomId, Long userId, Long ack) {
        chatroomRepository.setMyLastAck(roomId, userId, ack);
    }

    public MessagePage loadMessages(Long roomId, Long cursor, int limit) {

        // Query intentionally modifies the actual limit to :limit + 1
        // So that we know there are more items if this result's size is greater than the limit param
        List<MessageResponse> messages = messageRepository.loadMessages(roomId, cursor == null ? Long.MAX_VALUE : cursor, limit)
                .stream().map((v) -> new MessageResponse(
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

    public List<RoomMemberInfo> getMemberInfos(Long roomId) {
        return chatroomRepository.loadMemberInfos(roomId)
                .stream().map(v -> new RoomMemberInfo(
                        v.getRoomId(),
                        v.getUserId(),
                        v.getUsername(),
                        v.getTag(),
                        v.getJoinedAt().toInstant()
                )).toList();
    }
}
