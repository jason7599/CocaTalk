package com.jason7599.cocatalk.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String passwordHash;
    private Instant createdAt;

    public UserEntity(String username, String passwordHash) {
        this.username = username;
        this.passwordHash = passwordHash;
    }
}
