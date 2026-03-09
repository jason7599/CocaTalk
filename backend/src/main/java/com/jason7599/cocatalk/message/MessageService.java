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

    private static final int MESSAGE_PAGE_SIZE = 50;
    private static final int AROUND_BEFORE_LIMIT = 10;
    private static final int AROUND_AFTER_LIMIT = 40;

    private final MessageRepository messageRepository;

    /**
     * User scrolls up
     */
    public MessagePage fetchMessagesBefore(Long roomId, long cursor) {
        // ordered by seq asc
        List<MessageDto> messages = messageRepository.fetchMessagesBefore(roomId, cursor, MESSAGE_PAGE_SIZE + 1);

        if (messages.isEmpty()) {
            return MessagePage.empty();
        }

        boolean hasOlder = messages.size() == MESSAGE_PAGE_SIZE + 1;
        if (hasOlder) {
            messages.removeFirst();
        }

        return new MessagePage(
                messages,
                messages.getFirst().seq(),
                messages.getLast().seq(),
                hasOlder
        );
    }

    /**
     * Initial load, fetch messages around the user's last ack.
     */
    public MessagePage fetchMessagesAround(Long roomId, long cursor) {
        List<MessageDto> messages
                = messageRepository.fetchMessagesAround(roomId, cursor, AROUND_BEFORE_LIMIT + 1, AROUND_AFTER_LIMIT);

        if (messages.isEmpty()) {
            return MessagePage.empty();
        }

        int olderCount = 0;
        for (; olderCount <= Math.min(messages.size() - 1, AROUND_BEFORE_LIMIT)
                && messages.get(olderCount).seq() < cursor;
             olderCount++);

        boolean hasOlder = olderCount == AROUND_BEFORE_LIMIT + 1;
        if (hasOlder) {
            messages.removeFirst();
        }

        return new MessagePage(
                messages,
                messages.getFirst().seq(),
                messages.getLast().seq(),
                hasOlder
        );
    }

    /**
     * User scrolls down
     */
    public MessagePage fetchMessagesAfter(Long roomId, long cursor) {
        List<MessageDto> messages = messageRepository.fetchMessagesAfter(roomId, cursor, MESSAGE_PAGE_SIZE);

        if (messages.isEmpty()) {
            return MessagePage.empty();
        }

        return new MessagePage(
                messages,
                messages.getFirst().seq(),
                messages.getLast().seq(),
                true // hasOlder is irrelevant for forward pagination
        );
    }
}
