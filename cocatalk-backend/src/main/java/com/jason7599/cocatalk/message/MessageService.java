package com.jason7599.cocatalk.message;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageResponse sendMessage(Long roomId, Long userId, String username, MessageRequest request) {
        MessageResponseView view = messageRepository.insertMessage(roomId, userId, request.content());
        return new MessageResponse(
                view.getRoomId(),
                view.getSeqNo(),
                username,
                view.getContent(),
                view.getCreatedAt()
        );
    }
}
