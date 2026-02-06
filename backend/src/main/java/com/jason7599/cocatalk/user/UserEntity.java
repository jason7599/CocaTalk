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

    private String email;
    private String username;
    private String tag;

    private String passwordHash;

    @Column(insertable = false)
    private Instant createdAt;

    public UserEntity(String email, String username, String tag, String passwordHash) {
        this.email = email;
        this.username = username;
        this.tag = tag;
        this.passwordHash = passwordHash;
    }
}
