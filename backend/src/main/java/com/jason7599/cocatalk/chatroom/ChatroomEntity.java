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

    @Enumerated(EnumType.STRING)
    private ChatroomType type;

    private Long groupCreatorId;

    private Long directUserId1;
    private Long directUserId2;

    private long lastSeq;
    private Instant lastMessageAt;

    private Instant createdAt;
}
