package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.message.MessageDto;
import com.jason7599.cocatalk.message.MessagePage;
import com.jason7599.cocatalk.message.MessageService;
import com.jason7599.cocatalk.user.UserInfo;
import com.jason7599.cocatalk.user.relation.UserRelationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ChatroomService is the public API for all chatroom-related operations.
 * All message operations (loading, sending, acknowledging) must go through
 * this service to ensure membership and permission checks are enforced.
 * Lower-level services such as MessageService should not be called directly by controllers.
 */
@Service
@RequiredArgsConstructor
public class ChatroomService {

    private static final int MEMBER_NAMES_PREVIEW_PER_ROOM = 4;

    private final ChatroomRepository chatroomRepository;
    private final UserRelationService userRelationService;
    private final MessageService messageService;

    public List<ChatroomSummary> getChatroomSummaries(Long userId) {
        List<ChatroomSummaryQueryRow> chatroomSummaryRows = chatroomRepository.getChatroomSummaries(userId);

        List<ChatroomMemberRow> memberRows = chatroomRepository.batchFetchMemberRows(
                chatroomSummaryRows.stream().map(ChatroomSummaryQueryRow::getRoomId).toList(),
                userId,
                MEMBER_NAMES_PREVIEW_PER_ROOM
        );

        Map<Long, List<UserInfo>> membersMap =
                memberRows.stream()
                        .collect(Collectors.groupingBy(
                                ChatroomMemberRow::roomId,
                                Collectors.mapping(
                                        row -> new UserInfo(
                                                row.userId(),
                                                row.username()
                                        ),
                                        Collectors.toList()
                                )
                        ));

        return chatroomSummaryRows.stream()
                .map(row -> new ChatroomSummary(
                        row.getRoomId(),
                        row.getRoomType(),
                        membersMap.getOrDefault(row.getRoomId(), List.of()),
                        row.getTotalMemberCount(),
                        row.getMyLastAck(),
                        new MessageDto(
                                row.getRoomId(),
                                row.getLastSeq(),
                                row.getLastMessageKind(),
                                row.getLastMessageEventType(),
                                row.getLastActorId(),
                                row.getLastSenderName(),
                                row.getLastMessage(),
                                row.getLastEventData(),
                                row.getLastMessageAt()
                        )
                )).toList();
    }

    public void assertMembership(Long roomId, Long userId) {
        if (!chatroomRepository.isChatroomMember(roomId, userId)) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Not a member of this room");
        }
    }

    public ChatroomSummary getChatroomSummary(Long roomId, Long viewerId) {
        assertMembership(roomId, viewerId);

        ChatroomSummaryQueryRow row = chatroomRepository.getChatroomSummary(roomId, viewerId);
        return new ChatroomSummary(
                row.getRoomId(),
                row.getRoomType(),
                chatroomRepository.fetchMembersPreview(roomId, viewerId, MEMBER_NAMES_PREVIEW_PER_ROOM),
                row.getTotalMemberCount(),
                row.getMyLastAck(),
                new MessageDto(
                        row.getRoomId(),
                        row.getLastSeq(),
                        row.getLastMessageKind(),
                        row.getLastMessageEventType(),
                        row.getLastActorId(),
                        row.getLastSenderName(),
                        row.getLastMessage(),
                        row.getLastEventData(),
                        row.getLastMessageAt()
                )
        );
    }

    /**
     * @param requesterId Requesting user of this operation
     * @param targetId The target user of this direct chatroom
     */
    @Transactional
    public Long resolveDirectChatroom(Long requesterId, Long targetId) {
        if (requesterId.equals(targetId)) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Cannot create direct chatroom with self");
        }

        Long roomId = chatroomRepository.getOrCreateDirectChatroom(requesterId, targetId);
        chatroomRepository.ensureDirectChatroomMembers(roomId, requesterId, targetId);

        return roomId;
    }

    public ChatroomBootstrapDto bootstrap(Long roomId, Long viewerId) {
        assertMembership(roomId, viewerId);

        ChatroomEntity room = chatroomRepository.findById(roomId)
                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Room not found"));

        ChatroomMeta meta;
        if (room.getType() == ChatroomType.DIRECT) {
            Long otherUserId = room.getDirectUserId1().equals(viewerId)
                    ? room.getDirectUserId2()
                    : room.getDirectUserId1();
            meta = new ChatroomMeta(
                    ChatroomType.DIRECT,
                    null,
                    userRelationService.hasBlocked(otherUserId, viewerId)
            );
        } else {
            meta = new ChatroomMeta(
                    ChatroomType.GROUP,
                    room.getGroupCreatorId(),
                    false
            );
        }

        Long lastReadSeq = chatroomRepository.getMyLastAck(roomId, viewerId);

        return new ChatroomBootstrapDto(
                meta,
                chatroomRepository.fetchMembers(roomId),
                messageService.fetchMessagesAround(roomId, lastReadSeq),
                lastReadSeq,
                room.getLastSeq()
        );
    }

    public MessagePage loadMessagesBefore(Long roomId, long cursor, Long viewerId) {
        assertMembership(roomId, viewerId);
        return messageService.fetchMessagesBefore(roomId, cursor);
    }

    public MessagePage loadMessagesAfter(Long roomId, long cursor, Long viewerId) {
        assertMembership(roomId, viewerId);
        return messageService.fetchMessagesAfter(roomId, cursor);
    }
}
