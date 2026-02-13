package com.jason7599.cocatalk.chat;

import com.jason7599.cocatalk.chatroom.ChatroomService;
import com.jason7599.cocatalk.message.MessageRequest;
import com.jason7599.cocatalk.message.MessageService;
import com.jason7599.cocatalk.notification.UserNotificationService;
import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWsController {

    private final MessageService messageService;
    private final ChatroomService chatroomService;
    private final UserNotificationService userNotificationService;

    @MessageMapping("/chat.send")
    public void sendMessage(
            @Payload MessageRequest request,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        SendMessageResult result = messageService.sendMessage(userDetails.getId(), request);

        userNotificationService.dispatchMessageResult(result, userDetails, request);
    }

    @MessageMapping("/chat.ack.{roomId}")
    public void ackUpTo(@DestinationVariable Long roomId,
                        @Payload AckRequest payload,
                        Authentication authentication) {
        Long userId = ((CustomUserDetails) authentication.getPrincipal()).getId();
        chatroomService.setMyLastAck(roomId, userId, payload.ack());
    }
}
