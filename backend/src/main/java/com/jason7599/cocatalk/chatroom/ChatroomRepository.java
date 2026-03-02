package com.jason7599.cocatalk.chatroom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatroomRepository extends JpaRepository<ChatroomEntity, Long> {

    // TODO: add logic of omitting empty direct chatrooms
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
                ls.username AS lastSenderName,
                lm.content AS lastMessage,
                lm.created_at AS lastMessageAt
            FROM room_members rm_me
            JOIN rooms r ON rm_me.room_id = r.id
            JOIN (
                SELECT room_id, COUNT(*) AS cnt
                FROM room_members
                GROUP BY room_id
            ) mc ON mc.room_id = r.id
            JOIN messages lm ON lm.room_id = r.id AND lm.seq = r.last_seq
            JOIN users ls ON lm.actor_id = ls.id
            WHERE
                rm_me.user_id = :viewerId
            """, nativeQuery = true)
    List<ChatroomSummaryQueryRow> getChatroomSummaries(@Param("viewerId") Long viewerId);

    /**
     * Batch-fetch top limitPerRoom member names for each chatroom
     * @param roomIds List of chatroom Ids
     * @param viewerId User Id to exclude from the preview list
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
                WHERE rm.room_id = ANY(:roomIds)
                    AND rm.user_id <> :viewerId
            )
            SELECT
                cte.roomId,
                u.username
            FROM cte JOIN users u ON cte.userId = u.id
            WHERE cte.rn <= :limitPerRoom
            """, nativeQuery = true)
    List<ChatroomMemberNameRow> fetchRoomMemberPreviewRows(
            @Param("roomIds") List<Long> roomIds,
            @Param("viewerId") Long viewerId,
            @Param("limitPerRoom") int limitPerRoom);
}
