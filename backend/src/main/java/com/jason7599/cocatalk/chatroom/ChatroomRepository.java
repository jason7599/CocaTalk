package com.jason7599.cocatalk.chatroom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ChatroomRepository extends JpaRepository<ChatroomEntity, Long> {

    @Query(value = """
            SELECT
                r.id AS id,
                r.type AS type,
                other_rm.user_id AS otherUserId,
                r.group_creator_id AS groupCreatorId,
                rm.alias AS alias,
                m.content AS lastMessage,
                r.last_message_at AS lastMessageAt,
                r.last_seq AS lastSeq,
                rm.last_ack AS myLastAck,
                r.created_at AS createdAt
            FROM rooms r
            JOIN room_members rm ON rm.room_id = r.id
            LEFT JOIN room_members other_rm
                ON other_rm.room_id = r.id
                AND other_rm.user_id <> :userId
                AND r.type = 'DIRECT'
            LEFT JOIN messages m
                ON m.room_id = r.id
                AND m.seq_no = r.last_seq
            WHERE rm.user_id = :userId
            ORDER BY rm.joined_at
            """, nativeQuery = true)
    List<ChatroomSummaryRow> fetchChatroomSummaries(@Param("userId") Long userId);

    @Query(value = """
            SELECT user_id
            FROM room_members
            WHERE room_id = :roomId
            """, nativeQuery = true)
    Set<Long> getMembersId(@Param("roomId") Long roomId);

    @Query(value = """
        SELECT *
        FROM (
            SELECT
                rm.room_id AS roomId,
                u.id AS userId,
                u.username AS username,
                u.tag AS tag,
                rm.joined_at AS joinedAt,
                ROW_NUMBER() OVER (
                    PARTITION BY rm.room_id
                    ORDER BY u.username
                ) as rn
            FROM room_members rm
            JOIN users u ON rm.user_id = u.id
            WHERE rm.room_id = ANY(:roomIds)
        ) t
        WHERE t.rn <= :limit
        """, nativeQuery = true)
    List<RoomMemberInfoView> batchFetchChatMemberInfos(
            @Param("roomIds") Long[] roomIds,
            @Param("limit") int limit);

    @Modifying
    @Query(value = """
            INSERT INTO room_members(room_id, user_id, last_ack)
            SELECT :roomId, :userId, last_seq
            FROM rooms
            WHERE id = :roomId
            """, nativeQuery = true)
    void addUserToRoom(
            @Param("roomId") Long roomId,
            @Param("userId") Long userId);

    @Modifying
    @Query(value = """
            INSERT INTO room_members(room_id, user_id, last_ack)
            SELECT r.id, u.user_id, r.last_seq
            FROM rooms r CROSS JOIN UNNEST(:userIds) AS u(user_id)
            WHERE r.id = :roomId
            """, nativeQuery = true)
    void addUsersToRoom(
            @Param("roomId") Long roomId,
            @Param("userIds") Long[] userIds);

    @Query(value = """
            SELECT COUNT(*) > 0
            FROM room_members
            WHERE user_id = :userId AND room_id = :roomId
            """, nativeQuery = true)
    boolean isChatroomMember(@Param("roomId") Long roomId,
                             @Param("userId") Long userId);

    @Query(value = """
            SELECT r.*
            FROM rooms r JOIN direct_rooms dr ON dr.room_id = r.id
            WHERE dr.user1_id = LEAST(:userId1, :userId2)
              AND dr.user2_id = GREATEST(:userId1, :userId2)
            """, nativeQuery = true)
    Optional<ChatroomEntity> findDirectChatroom(@Param("userId1") Long userId1,
                                                @Param("userId2") Long userId2);

    // use in conjunction with save(chatroom).
    // JPA does not allow 2 separate insertions within one native query method
    @Modifying
    @Query(value = """
            INSERT INTO direct_rooms (room_id, user1_id, user2_id)
            VALUES (:roomId, LEAST(:userId1, :userId2), GREATEST(:userId1, :userId2))
            """, nativeQuery = true)
    void setDirectChatroom(@Param("roomId") Long roomId,
                              @Param("userId1") Long userId1,
                              @Param("userId2") Long userId2);

    @Modifying
    @Query(value = """
            UPDATE room_members
            SET last_ack = :ack
            WHERE room_id = :roomId AND user_id = :userId
                AND last_ack < :ack
            """, nativeQuery = true)
    void setMyLastAck(@Param("roomId") Long roomId,
                      @Param("userId") Long userId,
                      @Param("ack") Long ack);

    @Query(value = """
            SELECT
                rm.user_id AS id,
                u.username AS username,
                u.tag AS tag,
                rm.joined_at AS joinedAt
            FROM room_members rm JOIN users u ON rm.user_id = u.id
            WHERE rm.room_id = :roomId
            """, nativeQuery = true)
    List<RoomMemberInfoView> loadMemberInfos(@Param("roomId") Long roomId);

    @Query(value = """
        SELECT
            rm.room_id AS roomId,
            u.id AS userId,
            u.username AS username,
            u.tag AS tag,
            rm.joined_at AS joinedAt
        FROM room_members rm
        JOIN users u ON rm.user_id = u.id
        WHERE rm.user_id IN (:memberIds)
        ORDER BY u.username
        LIMIT :limit
        """, nativeQuery = true)
    List<RoomMemberInfoView> fetchMemberInfosPreview(
            @Param("memberIds") List<Long> memberIds,
            @Param("limit") int limit
    );
}
