package com.jason7599.cocatalk.notification;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class UserNotification {

    private UserNotificationType type;
    private UserNotificationPayload payload;

    public static UserNotification directChatCreated(DirectChatCreatedPayload payload) {
        return new UserNotification(UserNotificationType.DIRECT_CHAT_CREATED, payload);
    }

    public static UserNotification messagePreview(MessagePreviewPayload payload) {
        return new UserNotification(UserNotificationType.MESSAGE_PREVIEW, payload);
    }
}
