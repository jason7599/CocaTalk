package com.jason7599.cocatalk.chat;

import com.jason7599.cocatalk.message.MessageRequest;
import com.jason7599.cocatalk.message.MessageResponse;
import com.jason7599.cocatalk.message.MessageService;
import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @MessageMapping("/chat.send.{roomId}")
    public void sendMessage(
            @DestinationVariable Long roomId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Payload MessageRequest request) {

        MessageResponse messageResponse = messageService.sendMessage(
                roomId,
                userDetails.getId(),
                userDetails.getUsername(),
                request
        );

        messagingTemplate.convertAndSend("/topic/room.%d".formatted(roomId), messageResponse);

        // TODO: fanout notification, /user/queue/...
    }
}
