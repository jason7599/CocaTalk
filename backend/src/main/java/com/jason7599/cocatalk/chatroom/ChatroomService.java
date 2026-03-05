package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.message.MessageSummary;
import com.jason7599.cocatalk.user.UserInfo;
import com.jason7599.cocatalk.user.relation.UserRelationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatroomService {

    private static final int MEMBER_NAMES_PREVIEW_PER_ROOM = 4;

    private final ChatroomRepository chatroomRepository;
    private final ChatroomMemberService chatroomMemberService;
    private final UserRelationService userRelationService;

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
                        new MessageSummary(
                                row.getRoomId(),
                                row.getLastSeq(),
                                row.getLastMessageKind(),
                                row.getLastMessageEventType(),
                                row.getLastSenderName(),
                                row.getLastMessage(),
                                row.getLastMessageAt()
                        )
                )).toList();
    }

    public ChatroomSummary getChatroomSummary(Long roomId, Long viewerId) {
        chatroomMemberService.assertMembership(roomId, viewerId);

        ChatroomSummaryQueryRow row = chatroomRepository.getChatroomSummary(roomId, viewerId);
        return new ChatroomSummary(
                row.getRoomId(),
                row.getRoomType(),
                chatroomRepository.fetchMembersPreview(roomId, viewerId, MEMBER_NAMES_PREVIEW_PER_ROOM),
                row.getTotalMemberCount(),
                row.getMyLastAck(),
                new MessageSummary(
                        row.getRoomId(),
                        row.getLastSeq(),
                        row.getLastMessageKind(),
                        row.getLastMessageEventType(),
                        row.getLastSenderName(),
                        row.getLastMessage(),
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

    public ChatroomMeta fetchMetadata(Long roomId, Long viewerId) {
        chatroomMemberService.assertMembership(roomId, viewerId);

        ChatroomEntity room = chatroomRepository.findById(roomId)
                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Room not found"));

        if (room.getType() == ChatroomType.DIRECT) {
            Long otherUserId = room.getDirectUserId1().equals(viewerId)
                    ? room.getDirectUserId2()
                    : room.getDirectUserId1();
            return new ChatroomMeta(
                    ChatroomType.DIRECT,
                    null,
                    userRelationService.hasBlocked(otherUserId, viewerId)
            );
        } else {
            return new ChatroomMeta(
                    ChatroomType.GROUP,
                    room.getGroupCreatorId(),
                    false
            );
        }
    }
}
