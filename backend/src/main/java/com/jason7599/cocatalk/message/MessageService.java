package com.jason7599.cocatalk.message;

import com.jason7599.cocatalk.chatroom.ChatroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private static final int PAGE_SIZE = 30;

    private final MessageRepository messageRepository;
    private final ChatroomService chatroomService;

    public MessagePage loadMessages(Long roomId, Long viewerId, Long cursor) {
        chatroomService.assertMembership(roomId, viewerId);

        // ordered by seq asc
        List<MessageDto> list = messageRepository.fetchMessages(roomId, cursor, PAGE_SIZE + 1);

        boolean hasMore = list.size() == PAGE_SIZE + 1;
        if (hasMore) {
            list.removeFirst();
        }

        return new MessagePage(
                list,
                list.isEmpty() ? null : list.getFirst().seq(),
                hasMore
        );
    }
}
