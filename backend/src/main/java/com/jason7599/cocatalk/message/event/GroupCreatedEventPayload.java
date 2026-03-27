package com.jason7599.cocatalk.message.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;

public class GroupCreatedEventPayload implements EventMessagePayload {
    @Override
    public EventMessageType type() {
        return EventMessageType.GROUP_CREATED;
    }
    @Override
    public JsonNode toJson() {
        return JsonNodeFactory.instance.objectNode(); // empty
    }
}
