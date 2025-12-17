package com.jason7599.cocatalk.message;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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

    private Long userId;
    private String content;

    @Column(insertable = false)
    private Instant createdAt;
}
