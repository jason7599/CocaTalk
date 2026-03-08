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

    private static final int PAGE_SIZE = 30;

    private final MessageRepository messageRepository;

    /**
     * IMPORTANT:
     * This method does NOT perform membership or authorization checks.
     * Callers must ensure the viewer is a member of the room before invoking.
     * Intended to be used only by ChatroomService.
     */
    public MessagePage fetchMessagesBefore(Long roomId, Long cursor) {
        long effectiveCursor = cursor == null ? Long.MAX_VALUE : cursor;

        // ordered by seq asc
        List<MessageDto> messages = messageRepository.fetchMessages(roomId, effectiveCursor, PAGE_SIZE + 1);

        boolean hasMore = messages.size() == PAGE_SIZE + 1;
        if (hasMore) {
            messages.removeFirst();
        }

        return new MessagePage(
                messages,
                messages.isEmpty() ? null : messages.getFirst().seq(),
                hasMore
        );
    }

    public MessagePage fetchLatestMessages(Long roomId) {
        return fetchMessagesBefore(roomId, null);
    }
}
