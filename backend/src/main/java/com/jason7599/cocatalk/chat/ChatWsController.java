package com.jason7599.cocatalk.chat;

import com.jason7599.cocatalk.chatroom.ChatroomService;
import com.jason7599.cocatalk.message.MessagePreview;
import com.jason7599.cocatalk.message.MessageRequest;
import com.jason7599.cocatalk.message.MessageResponse;
import com.jason7599.cocatalk.message.MessageService;
import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Controller
@RequiredArgsConstructor
public class ChatWsController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final ChatroomService chatroomService;
    private final RoomMembershipService membershipCache; // redis

    @MessageMapping("/chat.send.{roomId}")
    public void sendMessage(
            @DestinationVariable Long roomId,
            @Payload MessageRequest request,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        MessageResponse messageResponse = messageService.sendMessage(
                roomId,
                userDetails.getId(),
                request
        );

        // This is for the users connected to topic/room.%d = users who have this chat window open
        messagingTemplate.convertAndSend("/topic/rooms.%d".formatted(roomId), messageResponse);

        // fanout notification, /user/queue/...
        // This is for the sidebar updates.
        for (Long memberId : membershipCache.loadMemberIds(roomId)) {
            messagingTemplate.convertAndSendToUser(
                    memberId.toString(),
                    "/queue/notifications",
                    new MessagePreview(
                            roomId,
                            messageResponse.seqNo(),
                            userDetails.getUsername(),
                            request.content(),
                            Instant.now()
                    )
            );
        }
    }

    @MessageMapping("/chat.ack.{roomId}")
    public void ackUpTo(@DestinationVariable Long roomId,
                        @Payload AckRequest payload,
                        Authentication authentication) {
        Long userId = ((CustomUserDetails) authentication.getPrincipal()).getId();
        chatroomService.setMyLastAck(roomId, userId, payload.ack());
    }
}
