package com.jason7599.cocatalk.message.event;

import lombok.Getter;

@Getter
public class EventMessage {

    private final EventMessageType type;
    private final EventData data;

    private EventMessage(EventMessageType type, EventData data) {
        this.type = type;
        this.data = data;
    }

    public static EventMessage groupCreated() {
        return new EventMessage(
                EventMessageType.GROUP_CREATED,
                new GroupCreatedData()
        );
    }
}
