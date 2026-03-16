package com.jason7599.cocatalk.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<MessageEntity, MessageId> {

    String MESSAGE_SELECT = """
            SELECT
                m.room_id AS roomId,
                m.seq,
                m.kind,
                m.event_type AS eventType,
                m.actor_id AS actorId,
                m.actor_name AS actorName,
                m.content,
                m.event_data AS eventData,
                m.created_at AS createdAt,
                m.client_id AS clientId
            FROM messages m
            """;

    @Query(value = """
            SELECT *
            FROM ("""
                + MESSAGE_SELECT + """
                WHERE m.room_id = :roomId
                    AND m.seq < :cursor
                ORDER BY m.seq DESC
                LIMIT :limit
            )
            ORDER BY seq ASC
            """, nativeQuery = true)
    List<MessageDto.Projection> fetchMessagesBefore(@Param("roomId") Long roomId,
                                         @Param("cursor") long cursor,
                                         @Param("limit") int limit);

    @Query(value = """
            (
                SELECT *
                FROM ("""
                    + MESSAGE_SELECT + """
                    WHERE m.room_id = :roomId
                        AND m.seq < :cursor
                    ORDER BY m.seq DESC
                    LIMIT :limitBefore
                )
                ORDER BY seq ASC
            )
            UNION ALL
            (
                SELECT *
                FROM ("""
                    + MESSAGE_SELECT + """
                    WHERE m.room_id = :roomId
                        AND m.seq >= :cursor
                    ORDER BY seq ASC
                    LIMIT :limitAfter
                )
            )
            """, nativeQuery = true)
    List<MessageDto.Projection> fetchMessagesAround(@Param("roomId") Long roomId,
                                         @Param("cursor") long cursor,
                                         @Param("limitBefore") int limitBefore,
                                         @Param("limitAfter") int limitAfter);

    @Query(value =
            MESSAGE_SELECT + """
            WHERE m.room_id = :roomId
                AND m.seq > :cursor
            ORDER BY m.seq ASC
            LIMIT :limit
            """, nativeQuery = true)
    List<MessageDto.Projection> fetchMessagesAfter(@Param("roomId") Long roomId,
                                        @Param("cursor") long cursor,
                                        @Param("limit") int limit);

    @Query(value = """
            WITH existing AS (
                SELECT *
                FROM messages
                WHERE room_id = :roomId
                  AND client_id = :clientId
            ),
            
            next_seq AS (
                UPDATE rooms
                SET last_seq = last_seq + 1
                WHERE id = :roomId
                  AND NOT EXISTS (SELECT 1 FROM existing)
                RETURNING last_seq
            ),
            
            inserted AS (
                INSERT INTO messages (
                    room_id,
                    seq,
                    actor_id,
                    actor_name,
                    kind,
                    event_type,
                    content,
                    event_data,
                    client_id
                )
                SELECT
                    :roomId,
                    last_seq,
                    :actorId,
                    :actorName,
                    :kind,
                    :eventType,
                    :content,
                    CAST(:eventData AS jsonb),
                    :clientId
                FROM next_seq
                RETURNING *
            )
         
            SELECT * FROM inserted
            UNION ALL
            SELECT * FROM existing
            """, nativeQuery = true)
    MessageEntity insertMessage(
            @Param("roomId") Long roomId,
            @Param("actorId") Long actorId,
            @Param("actorName") String actorName,
            @Param("kind") String kind,
            @Param("eventType") String eventType,
            @Param("content") String content,
            @Param("eventData") String eventData,
            @Param("clientId") UUID clientId
    );
}
