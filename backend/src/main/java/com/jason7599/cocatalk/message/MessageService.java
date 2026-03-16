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
        List<MessageDto.Projection> messages = messageRepository.fetchMessagesBefore(roomId, cursor, MESSAGE_PAGE_SIZE + 1);

        if (messages.isEmpty()) {
            return MessagePage.empty();
        }

        boolean hasOlder = messages.size() == MESSAGE_PAGE_SIZE + 1;
        if (hasOlder) {
            messages.removeFirst();
        }

        return new MessagePage(
                messages.stream().map(MessageDto::new).toList(),
                messages.getFirst().getSeq(),
                messages.getLast().getSeq(),
                hasOlder
        );
    }

    /**
     * Initial load, fetch messages around the user's last ack.
     */
    public MessagePage fetchMessagesAround(Long roomId, long cursor) {
        List<MessageDto.Projection> messages
                = messageRepository.fetchMessagesAround(roomId, cursor, AROUND_BEFORE_LIMIT + 1, AROUND_AFTER_LIMIT);

        if (messages.isEmpty()) {
            return MessagePage.empty();
        }

        int olderCount = 0;
        for (; olderCount <= Math.min(messages.size() - 1, AROUND_BEFORE_LIMIT)
                && messages.get(olderCount).getSeq() < cursor;
             olderCount++);

        boolean hasOlder = olderCount == AROUND_BEFORE_LIMIT + 1;
        if (hasOlder) {
            messages.removeFirst();
        }

        return new MessagePage(
                messages.stream().map(MessageDto::new).toList(),
                messages.getFirst().getSeq(),
                messages.getLast().getSeq(),
                hasOlder
        );
    }

    /**
     * User scrolls down
     */
    public MessagePage fetchMessagesAfter(Long roomId, long cursor) {
        List<MessageDto.Projection> messages = messageRepository.fetchMessagesAfter(roomId, cursor, MESSAGE_PAGE_SIZE);

        if (messages.isEmpty()) {
            return MessagePage.empty();
        }

        return new MessagePage(
                messages.stream().map(MessageDto::new).toList(),
                messages.getFirst().getSeq(),
                messages.getLast().getSeq(),
                true // hasOlder is irrelevant for forward pagination
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
