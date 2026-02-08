package com.jason7599.cocatalk.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    @Query(value = """
            SELECT *
            FROM users
            WHERE
                LOWER(CONCAT(username, '#', tag)) LIKE lower(CONCAT(:discriminator, '%'))
            ORDER BY
                CASE
                    WHEN lower(concat(username, '#', u.tag)) = lower(:discriminator) THEN 0
                    ELSE 1
                END,
                username
            LIMIT :limit
            """, nativeQuery = true)
    List<UserEntity> searchByDiscriminator(String discriminator, int limit);

    @Query(value = """
            SELECT COUNT(*) > 0
            FROM contacts
            WHERE user_id = :userId AND contact_id = :contactId
            """, nativeQuery = true)
    boolean contactExists(@Param("userId") Long userId, @Param("contactId") Long contactId);

    @Modifying
    @Query(value = """
            INSERT INTO contacts (user_id, contact_id)
            VALUES (:userId, :contactId)
            """, nativeQuery = true)
    void addContact(@Param("userId") Long userId, @Param("contactId") Long contactId);

    @Modifying
    @Query(value = """
            DELETE FROM contacts
            WHERE user_id = :userId AND contact_id = :contactId
            """, nativeQuery = true)
    void removeContact(@Param("userId") Long userId, @Param("contactId") Long contactId);

    @Query(value = """
            SELECT u.*
            FROM contacts c JOIN users u ON c.contact_id = u.id
            WHERE c.user_id = :userId
            ORDER BY u.username
            """, nativeQuery = true)
    List<UserEntity> listContacts(@Param("userId") Long userId);
}
