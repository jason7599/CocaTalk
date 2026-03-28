package com.jason7599.cocatalk.message.event;

import com.jason7599.cocatalk.chatroom.ChatroomSummary;
import com.jason7599.cocatalk.message.MessageDto;
import com.jason7599.cocatalk.message.MessageEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageDtoMapper {

    private final EventDataCodec eventDataCodec;

    public MessageDto fromEntity(MessageEntity e) {
        return new MessageDto(
                e.getId().roomId(),
                e.getId().seq(),
                e.getKind(),
                e.getEventType(),
                e.getActorId(),
                e.getActorName(),
                e.getContent(),
                eventDataCodec.fromJsonNode(e.getEventType(), e.getEventData()),
                e.getCreatedAt(),
                e.getClientId()
        );
    }

    public MessageDto fromProjection(MessageDto.Projection p) {
        return new MessageDto(
                p.getRoomId(),
                p.getSeq(),
                p.getKind(),
                p.getEventType(),
                p.getActorId(),
                p.getActorName(),
                p.getContent(),
                eventDataCodec.fromJson(p.getEventType(), p.getEventData()),
                p.getCreatedAt(),
                p.getClientId()
        );
    }

    public MessageDto fromChatroomProjection(ChatroomSummary.Projection p) {
        return new MessageDto(
                p.getRoomId(),
                p.getLastSeq(),
                p.getLastMessageKind(),
                p.getLastMessageEventType(),
                p.getLastActorId(),
                p.getLastActorName(),
                p.getLastMessage(),
                eventDataCodec.fromJson(p.getLastMessageEventType(), p.getLastEventData()),
                p.getLastMessageAt(),
                p.getLastMessageClientId()
        );
    }
}
