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

    private String name;

    @Column(insertable = false)
    private Long lastSeq;

    @Column(insertable = false)
    private Instant lastMessageAt;

    @Column(insertable = false)
    private Instant createdAt;

    public ChatroomEntity(String name) {
        this.name = name;
    }
}
