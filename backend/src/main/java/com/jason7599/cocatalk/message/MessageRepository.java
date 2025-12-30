package com.jason7599.cocatalk.message;

import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity, MessageId> {

    @Query(value = """
            WITH next AS (
                UPDATE rooms
                SET last_seq = last_seq + 1,
                    last_message_at = NOW()
                WHERE id = :roomId
                RETURNING last_seq
            )
            INSERT INTO messages (room_id, seq_no, user_id, content)
            SELECT :roomId, last_seq, :userId, :content
            FROM next
            RETURNING
                room_id AS roomId,
                seq_no AS seqNo,
                user_id AS userId,
                content,
                created_at AS createdAt
            """, nativeQuery = true)
    MessageResponseView insertMessage(@Param("roomId") Long roomId,
                                      @Param("userId") Long userId,
                                      @Param("content") String content);

    @Query(value = """
            SELECT *
            FROM (
                SELECT *
                FROM messages
                WHERE room_id = :roomId
                    AND seq_no < :cursor
                ORDER BY seq_no DESC
                LIMIT :limit + 1 --Inner DESC gets newest + 1 extra (sentinel)
            )
            ORDER BY seq_no ASC
            """, nativeQuery = true)
    List<MessageResponseView> loadMessages(@Param("roomId") Long roomId,
                                           @Param("cursor") Long cursor,
                                           @Param("limit") int limit);

    @Override
    @Deprecated // DONT USE
    <S extends MessageEntity> @NonNull S save(@NonNull S entity);
}
