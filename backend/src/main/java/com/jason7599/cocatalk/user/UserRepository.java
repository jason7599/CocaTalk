package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.friendship.FriendRequestView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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
            DELETE FROM friendships
            WHERE id1 = LEAST(:id1, :id2) AND id2 = GREATEST(:id1, :id2)
            """, nativeQuery = true)
    void removeFriendship(@Param("id1") Long id1, @Param("id2") Long id2);

    @Query(value = """
            SELECT u.*
            FROM users u
            JOIN friendships f
                ON (f.id1 = :userId AND f.id2 = u.id)
                OR (f.id2 = :userId AND f.id1 = u.id)
            """, nativeQuery = true)
    List<UserEntity> listFriends(@Param("userId") Long userId);

    @Query(value = """
            SELECT
                f.sender_id AS id,
                u.username AS username,
                f.created_at AS sentAt
            FROM friend_requests f JOIN users u
                ON f.sender_id = u.id
            WHERE f.receiver_id = :userId
            ORDER BY f.created_at DESC
            """, nativeQuery = true)
    List<FriendRequestView> listReceivedRequests(@Param("userId") Long userId);

    @Query(value = """
            SELECT
                f.receiver_id AS id,
                u.username AS username,
                f.created_at AS sentAt
            FROM friend_requests f JOIN users u
                ON f.receiver_id = u.id
            WHERE f.sender_id = :userId
            ORDER BY f.created_at DESC
            """, nativeQuery = true)
    List<FriendRequestView> listSentRequests(@Param("userId") Long userId);

    @Query(value = """
            SELECT COUNT(*)
            FROM friend_requests f JOIN users u
                ON f.sender_id = u.id
            WHERE f.receiver_id = :userId
            """, nativeQuery = true)
    int countPendingRequests(@Param("userId") Long userId);
}
