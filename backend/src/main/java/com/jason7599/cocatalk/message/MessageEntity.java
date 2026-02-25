package com.jason7599.cocatalk.message;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MessageEntity {

    @EmbeddedId
    private MessageId id;

    @Enumerated(EnumType.STRING)
    private MessageKind kind;

    @Enumerated(EnumType.STRING)
    private EventMessageType eventType;

    private String content;

    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode eventData;

    private Instant createdAt;
}
