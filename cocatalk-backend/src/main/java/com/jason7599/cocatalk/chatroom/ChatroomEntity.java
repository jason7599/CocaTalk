package com.jason7599.cocatalk.chatroom;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatroomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long creatorId;
    private String name;
    private Long lastSeq;
    private Instant lastMessageAt;
    private Instant createdAt;

    public ChatroomEntity(Long creatorId, String name) {
        this.creatorId = creatorId;
        this.name = name;
    }
}
