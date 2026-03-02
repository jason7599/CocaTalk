package com.jason7599.cocatalk.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByUsername(String username);

    @Query(value = """
            SELECT
                u.id AS userId,
                u.username
            FROM users u
            WHERE
                LOWER(u.username) ILIKE CONCAT(:query, '%')
                AND u.id <> :viewerId
            ORDER BY u.username
            LIMIT :limit
            """, nativeQuery = true)
    List<UserInfo> searchUsers(String query, Long viewerId, int limit);
}
