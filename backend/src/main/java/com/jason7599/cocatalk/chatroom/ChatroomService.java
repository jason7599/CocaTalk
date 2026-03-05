package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.message.MessageSummary;
import com.jason7599.cocatalk.user.UserInfo;
import com.jason7599.cocatalk.user.UserService;
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
    private final UserService userService;
    private final UserRelationService userRelationService;
    private final ChatroomMemberService chatroomMemberService;

    public List<ChatroomSummary> getChatroomSummaries(Long userId) {
        List<ChatroomSummaryQueryRow> chatroomSummaryRows = chatroomRepository.getChatroomSummaries(userId);

        List<ChatroomMemberNameRow> memberNameRows = chatroomRepository.batchFetchMemberNameRows(
                chatroomSummaryRows.stream().map(ChatroomSummaryQueryRow::getRoomId).toList(),
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

        return chatroomSummaryRows.stream()
                .map(row -> new ChatroomSummary(
                        row.getRoomId(),
                        memberNamesMap.getOrDefault(row.getRoomId(), List.of()),
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
        ChatroomSummaryQueryRow row = chatroomRepository.getChatroomSummary(roomId, viewerId);
        return new ChatroomSummary(
                row.getRoomId(),
                chatroomRepository.fetchMemberNamesPreview(roomId, viewerId, MEMBER_NAMES_PREVIEW_PER_ROOM),
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
    public ChatroomDetails getOrCreateDirectChatroom(Long requesterId, Long targetId) {
        if (requesterId.equals(targetId)) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Cannot create direct chatroom with self");
        }

        // throws 404 if not found
        UserInfo targetUser = userService.getUserInfo(targetId);

        boolean blockedByTarget = userRelationService.hasBlocked(targetId, requesterId);

        Long roomId = chatroomRepository.getOrCreateDirectChatroom(requesterId, targetId);

        chatroomRepository.ensureDirectChatroomMembers(roomId, requesterId, targetId);

        return new ChatroomDetails(
                roomId,
                ChatroomType.DIRECT,
                List.of(targetUser),
                null,
                blockedByTarget
        );
    }
}
