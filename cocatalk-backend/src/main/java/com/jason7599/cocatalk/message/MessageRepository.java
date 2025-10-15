package com.jason7599.cocatalk.message;

import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<MessageEntity, MessageId> {

    @Query(value = """
            WITH next AS (
                UPDATE rooms
                SET next_seq = next_seq + 1
                WHERE id = :roomId
                RETURNING next_seq
            )
            INSERT INTO messages(room_id, seq_no, user_id, content)
            SELECT :roomId, next_seq, :userId, :content
            FROM next
            RETURNING
                room_id AS roomId,
                seq_no AS seqNo,
                user_id AS userId,
                content,
                created_at AS createdAt
            """, nativeQuery = true)
    MessageResponseView save(@Param("roomId") Long roomId,
                             @Param("userId") Long userId,
                             @Param("content") String content);

    @Override
    @Deprecated // DONT USE
    <S extends MessageEntity> @NonNull S save(@NonNull S entity);
}
