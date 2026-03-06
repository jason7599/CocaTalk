package com.jason7599.cocatalk.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity, MessageId> {

    @Query(value = """
            SELECT *
            FROM (
                SELECT
                    m.room_id AS roomId,
                    m.seq,
                    m.kind,
                    m.event_type AS eventType,
                    m.actor_id AS actorId,
                    u.username AS senderName,
                    m.content,
                    m.event_data AS eventData,
                    m.created_at AS createdAt
                FROM messages m
                JOIN users u ON m.actor_id = u.id
                WHERE m.room_id = :roomId
                    AND (:cursor IS NULL OR m.seq < :cursor)
                ORDER BY m.seq DESC
                LIMIT :limit
            )
            ORDER BY seq ASC
            """, nativeQuery = true)
    List<MessageDto> fetchMessages(@Param("roomId") Long roomId,
                                   @Param("cursor") Long cursor,
                                   @Param("limit") int limit);
}
