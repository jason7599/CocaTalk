package com.jason7599.cocatalk.notification;

import com.jason7599.cocatalk.chat.RoomMembershipService;
import com.jason7599.cocatalk.chat.SendMessageResult;
import com.jason7599.cocatalk.message.MessageRequest;
import com.jason7599.cocatalk.security.CustomUserDetails;
import com.jason7599.cocatalk.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserNotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomMembershipService roomMembershipService;
    private final UserService userService;

    public void dispatchMessageResult(
            SendMessageResult result,
            CustomUserDetails sender,
            MessageRequest request
    ) {
        if (result.directRoomCreated()) {
            dispatchDirectChatCreated(result, sender, request);
        } else {
            dispatchMessagePreview(result, sender);
        }
    }

    private void dispatchDirectChatCreated(
            SendMessageResult result,
            CustomUserDetails sender,
            MessageRequest request
    ) {
        UserNotification notification = UserNotification.directChatCreated(new DirectChatCreatedPayload(
                sender.getId(),
                request.recipientId(),
                result.roomId(),
                result.message().content(),
                sender.getUsername(),
                userService.getUserInfo(request.recipientId()).username(),
                result.message().createdAt()
        ));

        sendToUser(sender.getId(), notification);
        sendToUser(request.recipientId(), notification);
    }

    private void dispatchMessagePreview(
            SendMessageResult result,
            CustomUserDetails sender
    ) {
        UserNotification notification = UserNotification.messagePreview(new MessagePreviewPayload(
                result.roomId(),
                result.message().seqNo(),
                sender.getUsername(),
                result.message().content(),
                result.message().createdAt()
        ));

        for (Long memberId : roomMembershipService.loadMemberIds(result.roomId())) {
            sendToUser(memberId, notification);
        }

        messagingTemplate.convertAndSend(
                "/topic/rooms.%d".formatted(result.roomId()),
                result.message()
        );
    }

    private void sendToUser(Long userId, UserNotification notification) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notification
        );
    }
}
