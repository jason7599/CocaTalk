package com.jason7599.cocatalk.message;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private MessageType type;

    private Long userId;
    private String content;

    @Column(insertable = false)
    private Instant createdAt;
}
