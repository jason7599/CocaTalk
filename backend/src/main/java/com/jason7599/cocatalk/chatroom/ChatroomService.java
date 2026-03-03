package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessageSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatroomService {

    private static final int MEMBER_NAMES_PREVIEW_PER_ROOM = 4;

    private final ChatroomRepository chatroomRepository;

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
}
