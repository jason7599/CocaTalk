package com.jason7599.cocatalk.message;

import com.jason7599.cocatalk.chatroom.ChatroomRepository;
import com.jason7599.cocatalk.exception.ApiError;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatroomRepository chatroomRepository;

    public MessageResponse sendMessage(Long roomId, Long userId, MessageRequest request) {

        if (!chatroomRepository.isChatroomMember(roomId, userId)) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Attempt to send message in a room not a member of");
        }

        // This step and this DTO are required to map Timestamp -> Instant
        MessageResponseView view = messageRepository.insertMessage(roomId, userId, request.content());

        return new MessageResponse(
                view.getRoomId(),
                userId,
                view.getSeqNo(),
                view.getContent(),
                view.getCreatedAt().toInstant()
        );
    }

    public MessagePage loadMessages(Long roomId, Long cursor, int limit) {
        // Query intentionally modifies the actual limit to :limit + 1
        // So that we know there are more items if this result's size is greater than the limit param
        List<MessageResponse> messages = messageRepository.loadMessages(roomId, cursor, limit)
                .stream().map((v) -> new MessageResponse(
                        v.getRoomId(),
                        v.getUserId(),
                        v.getSeqNo(),
                        v.getContent(),
                        v.getCreatedAt().toInstant()
                )).collect(Collectors.toCollection(ArrayList::new)); // collect to ArrayList so it is modifiable

        if (messages.isEmpty()) {
            return new MessagePage(
                    List.of(),
                    null,
                    false
            );
        }

        boolean hasMore = messages.size() > limit;
        if (hasMore) {
            messages.removeFirst();
        }

        return new MessagePage(
                messages,
                messages.getFirst().seqNo(),
                hasMore
        );
    }
}
