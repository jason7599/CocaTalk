package com.jason7599.cocatalk.notification;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

// polymorphic json
// discriminator field called "type"
// external_property means the discriminator field is not inside this object, but rather the same level as the payload
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(
                value = MessagePreviewPayload.class,
                name = "MESSAGE_PREVIEW"
        ),
        @JsonSubTypes.Type(
                value = DirectChatCreatedPayload.class,
                name = "DIRECT_CHAT_CREATED"
        )
})
public interface UserNotificationPayload {
}
