package com.jason7599.cocatalk.message;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Low-level message service for chatrooms.
 * This service does NOT perform membership authorization checks.
 * All message-related operations MUST be invoked through ChatroomService.
 */
@Service
@RequiredArgsConstructor
public class MessageService {

    private static final int OLDER_MESSAGE_PAGE_SIZE = 50;

    // How many messages before the unread boundary should we load?
    private static final int INITIAL_CONTEXT_SIZE = 50;

    // Maximum messages loaded during initial load
    private static final int INITIAL_LOAD_CAP = 5000;

    private final MessageRepository messageRepository;

    /**
     * User scrolls up
     */
    public MessagePage fetchOlderMessages(Long roomId, long cursor) {
        if (cursor <= 1) {
            return MessagePage.empty();
        }

        long start = Math.max(cursor - OLDER_MESSAGE_PAGE_SIZE, 1);
        long end = cursor - 1;

        List<MessageDto.Projection> projections = messageRepository.fetchMessagesRange(roomId, start, end);

        if (projections.isEmpty()) {
            return MessagePage.empty();
        }

        boolean hasOlder = start > 1;
        long nextCursor = hasOlder ? start : 0;

        return new MessagePage(
                projections.stream().map(MessageDto::new).toList(),
                nextCursor,
                hasOlder
        );
    }

    /**
     * Initial bootstrap
     */
    public MessagePage fetchInitialMessages(Long roomId, long myLastAck, long lastSeq) {
        if (lastSeq == 0) {
            return MessagePage.empty();
        }

        long start = Math.max(
                Math.max(myLastAck - INITIAL_CONTEXT_SIZE, lastSeq - INITIAL_LOAD_CAP),
                1 // seq starts at 1
        );

        List<MessageDto.Projection> projections = messageRepository.fetchMessagesRange(roomId, start, lastSeq);

        if (projections.isEmpty()) {
            return MessagePage.empty();
        }

        long firstSeq = projections.getFirst().getSeq();
        boolean hasOlder = firstSeq > 1;
        long nextCursor = hasOlder ? firstSeq : 0;

        return new MessagePage(
                projections.stream().map(MessageDto::new).toList(),
                nextCursor,
                hasOlder
        );
    }

    public MessageEntity insertUserMessage(
            Long roomId,
            Long userId,
            String username,
            SendMessageRequest request
    ) {
        return messageRepository.insertMessage(
                roomId,
                userId,
                username,
                MessageKind.USER.name(),
                null,
                request.content(),
                null,
                request.clientId()
        );
    }
}
