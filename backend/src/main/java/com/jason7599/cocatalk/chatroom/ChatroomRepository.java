package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.user.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface ChatroomRepository extends JpaRepository<ChatroomEntity, Long> {

    /**
     * @param viewerId ID of the user to view these summaries
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
                lm.created_at AS lastMessageAt,
                lm.client_id AS lastMessageClientId
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
                AND r.last_seq > 0
            """, nativeQuery = true)
    List<ChatroomSummary.Projection> getChatroomSummaries(@Param("viewerId") long viewerId);
// -- empty chatrooms are not shown. This only applies to direct chatrooms, as group chatrooms always have a "room created" message

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
                lm.created_at AS lastMessageAt,
                lm.client_id AS lastMessageClientId
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
    ChatroomSummary.Projection getChatroomSummary(@Param("roomId") long roomId,
                                                  @Param("viewerId") long viewerId);

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
                cte.userId,
                u.username
            FROM cte JOIN users u ON cte.userId = u.id
            WHERE cte.rn <= :limitPerRoom
            """, nativeQuery = true)
    List<ChatroomMemberRow> batchFetchMemberRows(
            @Param("roomIds") List<Long> roomIds,
            @Param("viewerId") long viewerId,
            @Param("limitPerRoom") int limitPerRoom);

    @Query(value = """
            SELECT
                u.id as userId,
                u.username
            FROM room_members rm JOIN users u on rm.user_id = u.id
            WHERE rm.room_id = :roomId
                AND rm.user_id <> :viewerId
            ORDER BY rm.joined_at
            LIMIT :limit
            """, nativeQuery = true)
    List<UserInfo> fetchMembersPreview(@Param("roomId") long roomId,
                                       @Param("viewerId") long viewerId,
                                       @Param("limit") int limit);

    // No @Modifying since this query returns a row value instead of number of rows affected
    @Query(value = """
            INSERT INTO rooms (type, direct_user_id1, direct_user_id2)
            VALUES ('DIRECT', LEAST(:u1, :u2), GREATEST(:u1, :u2))
            ON CONFLICT (direct_user_id1, direct_user_id2) WHERE type = 'DIRECT'
            DO UPDATE SET id = rooms.id -- This is just a harmless no-op update so that it returns this existing row
            RETURNING id
            """, nativeQuery = true)
    long getOrCreateDirectChatroom(@Param("u1") long u1, @Param("u2") long u2);

    @Query(value = """
            INSERT INTO rooms (type, group_creator_id)
            VALUES ('GROUP', :creatorId)
            RETURNING id
            """, nativeQuery = true)
    long createGroupChatroom(@Param("creatorId") long creatorId);

    /**
     * Adds the given users as members for the given chatroom.
     * This method is intentionally idempotent.
     */
    @Modifying
    @Query(value = """
            INSERT INTO room_members (room_id, user_id)
            SELECT :roomId, UNNEST(:userIds)
            ON CONFLICT DO NOTHING
            """, nativeQuery = true)
    void ensureChatroomMembers(@Param("roomId") long roomId, @Param("userIds") Long[] userIds);

    @Query(value = """
            SELECT
                u.id AS userId,
                u.username
            FROM room_members rm JOIN users u ON rm.user_id = u.id
            WHERE rm.room_id = :roomId
                AND rm.user_id <> :viewerId
            """, nativeQuery = true)
    List<UserInfo> fetchMembers(@Param("roomId") long roomId, @Param("viewerId") long viewerId);

    @Query(value = """
            SELECT COUNT(*) > 0
            FROM room_members
            WHERE room_id = :roomId AND user_id = :userId
            """, nativeQuery = true)
    boolean isChatroomMember(@Param("roomId") long roomId, @Param("userId") long userId);

    @Query(value = """
            SELECT last_ack
            FROM room_members
            WHERE room_id = :roomId AND user_id = :userId
            """, nativeQuery = true)
    long getMyLastAck(@Param("roomId") long roomId, @Param("userId") long userId);

    @Modifying
    @Query(value = """
            UPDATE room_members
            SET last_ack = :seq
            WHERE room_id = :roomId AND user_id = :userId
                AND last_ack < :seq -- monotonic
            """, nativeQuery = true)
    void updateLastAck(@Param("roomId") long roomId, @Param("userId") long userId, @Param("seq") long seq);

    @Query(value = """
            SELECT user_id
            FROM room_members
            WHERE room_id = :roomId
            """, nativeQuery = true)
    Set<Long> fetchChatroomMemberIds(@Param("roomId") long roomId);
}
