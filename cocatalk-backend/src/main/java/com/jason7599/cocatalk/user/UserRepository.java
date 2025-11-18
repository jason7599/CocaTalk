package com.jason7599.cocatalk.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query(value = """
            SELECT COUNT(*) > 0
            FROM friend_requests
            WHERE sender_id = :senderId AND receiver_id = :receiverId
            """, nativeQuery = true)
    boolean friendRequestExists(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

    @Modifying
    @Query(value = """
            INSERT INTO friend_requests (sender_id, receiver_id)
            VALUES (:senderId, :receiverId)
            """, nativeQuery = true)
    void addFriendRequest(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

    @Modifying
    @Query(value = """
            DELETE FROM friend_requests
            WHERE sender_id = :senderId AND receiver_id = :receiverId
            """, nativeQuery = true)
    void removeFriendRequest(@Param("senderId") Long senderId, @Param("receiverId") Long recevierId);

    @Query(value = """
            SELECT COUNT(*) > 0
            FROM friendships
            WHERE id1 = LEAST(:id1, :id2) AND id2 = GREATEST(:id1, :id2)
            """, nativeQuery = true)
    boolean friendshipExists(@Param("id1") Long id1, @Param("id2") Long id2);

    @Modifying
    @Query(value = """
            INSERT INTO friendships (id1, id2)
            VALUES (LEAST(:id1, :id2), GREATEST(:id1, :id2))
            """, nativeQuery = true)
    void addFriendship(@Param("id1") Long id1, @Param("id2") Long id2);

    @Modifying
    @Query(value = """
            DELTE FROM friendships
            WHERE id1 = LEAST(:id1, :id2) AND id2 = GREATEST(:id1, :id2)
            """, nativeQuery = true)
    void removeFriendship(@Param("id1") Long id1, @Param("id2") Long id2);
}
