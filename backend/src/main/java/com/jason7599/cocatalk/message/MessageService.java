package com.jason7599.cocatalk.message;

import com.jason7599.cocatalk.chat.SendMessageResult;
import com.jason7599.cocatalk.chatroom.ChatroomService;
import com.jason7599.cocatalk.exception.ApiError;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatroomService chatroomService;

    @Transactional
    public SendMessageResult sendMessage(Long userId, MessageRequest request) {
        Long roomId;
        boolean roomCreated = false;
        if (request.roomId() != null) {
            if (!chatroomService.isChatroomMember(request.roomId(), userId)) {
                throw new ApiError(HttpStatus.FORBIDDEN, "Attempt to send message in a room not a member of");
            }
            roomId = request.roomId();
        } else {
            if (request.recipientId() == null) {
                throw new ApiError(HttpStatus.BAD_REQUEST, "Both roomId and recipientId are null");
            }

            roomId = chatroomService.addDirectChatroom(userId, request.recipientId()).getId();
            roomCreated = true;
        }

        // This step and this DTO are required to map Timestamp -> Instant
        MessageResponseView view = messageRepository.insertMessage(roomId, userId, request.content());
        MessageResponse mesage = new MessageResponse(
                userId,
                view.getSeqNo(),
                view.getContent(),
                view.getCreatedAt().toInstant()
        );

        return new SendMessageResult(roomId, mesage, roomCreated);
    }
}
