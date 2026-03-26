package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.message.MessageDto;
import com.jason7599.cocatalk.message.MessagePage;
import com.jason7599.cocatalk.message.MessageService;
import com.jason7599.cocatalk.message.SendMessageRequest;
import com.jason7599.cocatalk.user.UserInfo;
import com.jason7599.cocatalk.user.relation.UserRelationService;
import com.jason7599.cocatalk.websocket.EventPublisher;
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
    private final EventPublisher eventPublisher;

    public List<ChatroomSummary> getChatroomSummaries(long userId) {
        List<ChatroomSummary.Projection> chatroomSummaryProjections = chatroomRepository.getChatroomSummaries(userId);

        List<ChatroomMemberRow> memberRows = chatroomRepository.batchFetchMemberRows(
                chatroomSummaryProjections.stream().map(ChatroomSummary.Projection::getRoomId).toList(),
                userId,
                MEMBER_NAMES_PREVIEW_PER_ROOM
        );

        Map<Long, List<UserInfo>> membersMap =
                memberRows.stream()
                        .collect(Collectors.groupingBy(
                                ChatroomMemberRow::roomId,
                                Collectors.mapping(
                                        row -> new UserInfo(row.userId(), row.username()),
                                        Collectors.toList()
                                )
                        ));

        return chatroomSummaryProjections.stream()
                .map(proj -> new ChatroomSummary(
                        proj.getRoomId(),
                        proj.getRoomType(),
                        membersMap.getOrDefault(proj.getRoomId(), List.of()),
                        proj.getTotalMemberCount(),
                        proj.getMyLastAck(),
                        new MessageDto(
                                proj.getRoomId(),
                                proj.getLastSeq(),
                                proj.getLastMessageKind(),
                                proj.getLastMessageEventType(),
                                proj.getLastActorId(),
                                proj.getLastActorName(),
                                proj.getLastMessage(),
                                proj.getLastEventData(),
                                proj.getLastMessageAt(),
                                proj.getLastMessageClientId()
                        )
                )).toList();
    }

    public void assertMembership(long roomId, long userId) {
        if (!chatroomRepository.isChatroomMember(roomId, userId)) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Not a member of this room");
        }
    }

    public ChatroomSummary getChatroomSummary(long roomId, long viewerId) {
        assertMembership(roomId, viewerId);

        ChatroomSummary.Projection proj = chatroomRepository.getChatroomSummary(roomId, viewerId);
        return new ChatroomSummary(
                proj.getRoomId(),
                proj.getRoomType(),
                chatroomRepository.fetchMembersPreview(roomId, viewerId, MEMBER_NAMES_PREVIEW_PER_ROOM),
                proj.getTotalMemberCount(),
                proj.getMyLastAck(),
                new MessageDto(
                        proj.getRoomId(),
                        proj.getLastSeq(),
                        proj.getLastMessageKind(),
                        proj.getLastMessageEventType(),
                        proj.getLastActorId(),
                        proj.getLastActorName(),
                        proj.getLastMessage(),
                        proj.getLastEventData(),
                        proj.getLastMessageAt(),
                        proj.getLastMessageClientId()
                )
        );
    }

    /**
     * @param requesterId Requesting user of this operation
     * @param targetId The target user of this direct chatroom
     */
    @Transactional
    public long resolveDirectChatroom(long requesterId, long targetId) {
        if (requesterId == targetId) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Cannot create direct chatroom with self");
        }

        long roomId = chatroomRepository.getOrCreateDirectChatroom(requesterId, targetId);
        chatroomRepository.ensureDirectChatroomMembers(roomId, requesterId, targetId);

        return roomId;
    }

    public ChatroomBootstrapDto bootstrap(long roomId, long userId) {
        assertMembership(roomId, userId);

        ChatroomEntity room = chatroomRepository.findById(roomId)
                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Room not found"));

        ChatroomMeta meta;
        if (room.getType() == ChatroomType.DIRECT) {
            long otherUserId = room.getDirectUserId1().equals(userId)
                    ? room.getDirectUserId2()
                    : room.getDirectUserId1();
            meta = new ChatroomMeta(
                    ChatroomType.DIRECT,
                    null,
                    userRelationService.hasBlocked(otherUserId, userId)
            );
        } else {
            meta = new ChatroomMeta(
                    ChatroomType.GROUP,
                    room.getGroupCreatorId(),
                    false
            );
        }

        long myLastAck = chatroomRepository.getMyLastAck(roomId, userId);

        return new ChatroomBootstrapDto(
                meta,
                chatroomRepository.fetchMembers(roomId, userId),
                messageService.fetchInitialMessages(roomId, myLastAck, room.getLastSeq()),
                myLastAck,
                room.getLastSeq()
        );
    }

    public MessagePage loadOlderMessages(long roomId, long viewerId, long cursor) {
        assertMembership(roomId, viewerId);
        return messageService.fetchOlderMessages(roomId, cursor);
    }

    @Transactional
    public MessageDto sendMessage(long roomId, long userId, String username, SendMessageRequest request) {
        assertMembership(roomId, userId);

        MessageDto message = new MessageDto(messageService.insertUserMessage(roomId,
                userId,
                username,
                request));

        eventPublisher.publishMessage(message);

        return message;
    }

    @Transactional
    public void updateLastAck(long roomId, long userId, long seq) {
        assertMembership(roomId, userId);
        chatroomRepository.updateLastAck(roomId, userId, seq);
    }
}
