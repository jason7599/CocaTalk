package com.jason7599.cocatalk.chat;

import com.jason7599.cocatalk.message.MessageRequest;
import com.jason7599.cocatalk.message.MessageService;
import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

@Controller
@MessageMapping
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate template;
    private final MessageService messageService;

    @MessageMapping("/chat.send.{roomId}")
    public void handle(
            @DestinationVariable Long roomId,
            MessageRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        template.convertAndSend("/topic/rooms.%d".formatted(roomId),
                messageService.send(
                        roomId,
                        userDetails.getId(),
                        userDetails.getUsername(),
                        request));
    }
}
