package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.user.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatroomRepository extends JpaRepository<ChatroomEntity, Long> {

    /**
     * @param viewerId Id of the user to view these summaries
     * @return List of chatroom summary rows (without member name previews)
     */
    @Query(value = """
            SELECT
                r.id AS roomId,
                r.type AS roomType,
                mc.cnt AS totalMemberCount,
                rm_me.last_ack AS myLastAck,
                r.last_seq AS lastSeq,
                lm.kind AS lastMessageKind,
                lm.event_type AS lastMessageEventType,
                lm.actor_id AS lastActorId,
                lm.actor_name AS lastActorName,
                lm.content AS lastMessage,
                lm.event_data AS lastEventData,
                lm.created_at AS lastMessageAt
            FROM room_members rm_me
            JOIN rooms r ON rm_me.room_id = r.id
            JOIN (
                SELECT room_id, COUNT(*) AS cnt
                FROM room_members
                GROUP BY room_id
            ) mc ON mc.room_id = r.id
            JOIN messages lm ON lm.room_id = r.id AND lm.seq = r.last_seq
            WHERE
                rm_me.user_id = :viewerId
                AND r.last_seq > 0 -- empty chatrooms are not shown
            """, nativeQuery = true)
    List<ChatroomSummary.Projection> getChatroomSummaries(@Param("viewerId") Long viewerId);

    @Query(value = """
            SELECT
                r.id AS roomId,
                r.type AS roomType,
                mc.cnt AS totalMemberCount,
                rm_me.last_ack AS myLastAck,
                r.last_seq AS lastSeq,
                lm.kind AS lastMessageKind,
                lm.event_type AS lastMessageEventType,
                lm.actor_id AS lastActorId,
                lm.actor_name AS lastActorName,
                lm.content AS lastMessage,
                lm.event_data AS lastEventData,
                lm.created_at AS lastMessageAt
            FROM room_members rm_me
            JOIN rooms r ON rm_me.room_id = r.id
            JOIN (
                SELECT room_id, COUNT(*) AS cnt
                FROM room_members
                WHERE room_id = :roomId
                GROUP BY room_id
            ) mc ON mc.room_id = r.id
            JOIN messages lm ON lm.room_id = r.id AND lm.seq = r.last_seq
            JOIN users ls ON lm.actor_id = ls.id
            WHERE
                rm_me.user_id = :viewerId
                AND r.id = :roomId
            """, nativeQuery = true)
    ChatroomSummary.Projection getChatroomSummary(@Param("roomId") Long roomId,
                                                 @Param("viewerId") Long viewerId);

    /**
     * Batch-fetch top limitPerRoom members for each chatroom
     * @param roomIds List of chatroom Ids
     * @param limitPerRoom Limit on how many member names to fetch per room
     */
    @Query(value = """
            WITH cte AS (
                SELECT
                    rm.room_id AS roomId,
                    rm.user_id AS userId,
                    ROW_NUMBER() OVER (
                        PARTITION BY rm.room_id
                        ORDER BY rm.joined_at
                    ) AS rn
                FROM room_members rm
                WHERE rm.room_id IN (:roomIds)
                    AND rm.user_id <> :viewerId
            )
            SELECT
                cte.roomId,
                u.id AS userId,
                u.username
            FROM cte JOIN users u ON cte.userId = u.id
            WHERE cte.rn <= :limitPerRoom
            """, nativeQuery = true)
    List<ChatroomMemberRow> batchFetchMemberRows(
            @Param("roomIds") List<Long> roomIds,
            @Param("viewerId") Long viewerId,
            @Param("limitPerRoom") int limitPerRoom);

    @Query(value = """
            SELECT
                u.id AS userId,
                u.username
            FROM room_members rm JOIN users u on rm.user_id = u.id
            WHERE rm.room_id = :roomId
                AND rm.user_id <> :viewerId
            ORDER BY rm.joined_at
            LIMIT :limit
            """, nativeQuery = true)
    List<UserInfo> fetchMembersPreview(@Param("roomId") Long roomId,
                                       @Param("viewerId") Long viewerId,
                                       @Param("limit") int limit);

    // No @Modifying since this query returns a row value instead of number of rows affected
    @Query(value = """
            INSERT INTO rooms (type, direct_user_id1, direct_user_id2)
            VALUES ('DIRECT', LEAST(:u1, :u2), GREATEST(:u1, :u2))
            ON CONFLICT (direct_user_id1, direct_user_id2) WHERE type = 'DIRECT'
            DO UPDATE SET id = rooms.id -- This is just a harmless no-op update so that it returns this existing row
            RETURNING id
            """, nativeQuery = true)
    Long getOrCreateDirectChatroom(@Param("u1") Long u1, @Param("u2") Long u2);

    /**
     * Ensures that the 2 users participating in a DIRECT chatroom are present in room_members.
     * This method is specifically intended for DIRECT chatrooms created via getOrCreateChatroom.
     * This method is intentionally idempotent.
     */
    @Modifying
    @Query(value = """
            INSERT INTO room_members (room_id, user_id)
            VALUES (:roomId, :u1), (:roomId, :u2)
            ON CONFLICT DO NOTHING
            """, nativeQuery = true)
    void ensureDirectChatroomMembers(@Param("roomId") Long roomId, @Param("u1") Long u1, @Param("u2") Long u2);

    @Query(value = """
            SELECT
                u.id AS userId,
                u.username
            FROM room_members rm JOIN users u ON rm.user_id = u.id
            WHERE rm.room_id = :roomId
            """, nativeQuery = true)
    List<UserInfo> fetchMembers(@Param("roomId") Long roomId);

    @Query(value = """
            SELECT COUNT(*) > 0
            FROM room_members
            WHERE room_id = :roomId AND user_id = :userId
            """, nativeQuery = true)
    boolean isChatroomMember(@Param("roomId") Long roomId, @Param("userId") Long userId);

    @Query(value = """
            SELECT last_ack
            FROM room_members
            WHERE room_id = :roomId AND user_id = :userId
            """, nativeQuery = true)
    Long getMyLastAck(@Param("roomId") Long roomId, @Param("userId") Long userId);
}
