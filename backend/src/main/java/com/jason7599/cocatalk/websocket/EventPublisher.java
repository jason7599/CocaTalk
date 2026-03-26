package com.jason7599.cocatalk.websocket;

import com.jason7599.cocatalk.chatroom.ChatroomMembershipCache;
import com.jason7599.cocatalk.message.MessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatroomMembershipCache membershipCache;

    public void publishMessage(MessageDto message) {
        for (long userId : membershipCache.fetch(message.roomId())) {
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(userId),
                    "/queue/messages",
                    message
            );
        }
    }
}
