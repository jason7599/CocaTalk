package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.message.MessageDto;
import com.jason7599.cocatalk.message.MessagePage;
import com.jason7599.cocatalk.message.MessageService;
import com.jason7599.cocatalk.message.SendMessageRequest;
import com.jason7599.cocatalk.security.CustomUserDetails;
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
        List<ChatroomSummary.Projection> chatroomSummaryProjections = chatroomRepository.getChatroomSummaries(userId);

        List<ChatroomMemberNameRow> memberNameRows = chatroomRepository.batchFetchMemberRows(
                chatroomSummaryProjections.stream().map(ChatroomSummary.Projection::getRoomId).toList(),
                userId,
                MEMBER_NAMES_PREVIEW_PER_ROOM
        );

        Map<Long, List<String>> memberNamesMap =
                memberNameRows.stream()
                        .collect(Collectors.groupingBy(
                                ChatroomMemberNameRow::roomId,
                                Collectors.mapping(
                                        ChatroomMemberNameRow::username,
                                        Collectors.toList()
                                )
                        ));

        return chatroomSummaryProjections.stream()
                .map(proj -> new ChatroomSummary(
                        proj.getRoomId(),
                        proj.getRoomType(),
                        memberNamesMap.getOrDefault(proj.getRoomId(), List.of()),
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

    public void assertMembership(Long roomId, Long userId) {
        if (!chatroomRepository.isChatroomMember(roomId, userId)) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Not a member of this room");
        }
    }

    public ChatroomSummary getChatroomSummary(Long roomId, Long viewerId) {
        assertMembership(roomId, viewerId);

        ChatroomSummary.Projection proj = chatroomRepository.getChatroomSummary(roomId, viewerId);
        return new ChatroomSummary(
                proj.getRoomId(),
                proj.getRoomType(),
                chatroomRepository.fetchMemberNamesPreview(roomId, viewerId, MEMBER_NAMES_PREVIEW_PER_ROOM),
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
    public Long resolveDirectChatroom(Long requesterId, Long targetId) {
        if (requesterId.equals(targetId)) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Cannot create direct chatroom with self");
        }

        Long roomId = chatroomRepository.getOrCreateDirectChatroom(requesterId, targetId);
        chatroomRepository.ensureDirectChatroomMembers(roomId, requesterId, targetId);

        return roomId;
    }

    public ChatroomBootstrapDto bootstrap(Long roomId, Long userId) {
        assertMembership(roomId, userId);

        ChatroomEntity room = chatroomRepository.findById(roomId)
                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Room not found"));

        ChatroomMeta meta;
        if (room.getType() == ChatroomType.DIRECT) {
            Long otherUserId = room.getDirectUserId1().equals(userId)
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

        Long myLastAck = chatroomRepository.getMyLastAck(roomId, userId);

        return new ChatroomBootstrapDto(
                meta,
                chatroomRepository.fetchMembers(roomId, userId),
                messageService.fetchInitialMessages(roomId, myLastAck, room.getLastSeq()),
                myLastAck,
                room.getLastSeq()
        );
    }

    public MessagePage loadOlderMessages(Long roomId, Long viewerId, long cursor) {
        assertMembership(roomId, viewerId);
        return messageService.fetchOlderMessages(roomId, cursor);
    }


    public MessageDto sendMessage(Long roomId, CustomUserDetails userDetails, SendMessageRequest request) {
        assertMembership(roomId, userDetails.getId());
        return new MessageDto(messageService.insertUserMessage(
                roomId,
                userDetails.getId(),
                userDetails.getUsername(),
                request));
    }
}
