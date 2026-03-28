package com.jason7599.cocatalk.message.event;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

import static com.jason7599.cocatalk.message.event.EventMessageType.GROUP_CREATED;

@Component
@RequiredArgsConstructor
public class EventDataCodec {

    private static final Map<EventMessageType, Class<? extends EventData>> REGISTRY = Map.of(
            GROUP_CREATED, GroupCreatedData.class
    );

    private final ObjectMapper objectMapper;

    public String toJson(EventData data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize EventData", e);
        }
    }

    public EventData fromJson(EventMessageType type, String json) {
        if (type == null || json == null) return null;
        try {
            return objectMapper.readValue(json, REGISTRY.get(type));
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize EventData", e);
        }
    }

    public EventData fromJsonNode(EventMessageType type, JsonNode node) {
        if (type == null || node == null) return null;
        try {
            return objectMapper.treeToValue(node, REGISTRY.get(type));
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize EventData", e);
        }
    }
}
