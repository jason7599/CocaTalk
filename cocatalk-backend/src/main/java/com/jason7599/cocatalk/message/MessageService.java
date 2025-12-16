package com.jason7599.cocatalk.message;

import com.jason7599.cocatalk.chatroom.ChatroomRepository;
import com.jason7599.cocatalk.exception.ApiError;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatroomRepository chatroomRepository;

    public MessageResponse sendMessage(Long roomId, Long userId, String username, MessageRequest request) {

        if (!chatroomRepository.isChatroomMember(roomId, userId)) {
            throw new ApiError(HttpStatus.FORBIDDEN, "Attempt to send message in an unjoined room");
        }

        // This step and this DTO are required to map Timestamp -> Instant
        MessageResponseView view = messageRepository.insertMessage(roomId, userId, request.content());

        return new MessageResponse(
                view.getRoomId(),
                view.getSeqNo(),
                username,
                view.getContent(),
                view.getCreatedAt().toInstant()
        );
    }
}
