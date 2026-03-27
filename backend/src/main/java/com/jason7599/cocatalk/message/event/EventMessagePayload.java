package com.jason7599.cocatalk.message.event;

import com.fasterxml.jackson.databind.JsonNode;

public interface EventMessagePayload {
    EventMessageType type();
    JsonNode toJson();
}
