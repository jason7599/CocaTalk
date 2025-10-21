package com.jason7599.cocatalk.chatroom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatroomRepository extends JpaRepository<ChatroomEntity, Long> {

    @Query(value = """
            SELECT
                r.id AS id,
                r.name AS name,
                m.content AS lastMessage,
                r.last_message_at AS lastMessageAt
            FROM rooms r
            JOIN room_members rm ON r.id = rm.room_id
            LEFT JOIN messages m ON r.id = m.room_id AND r.last_seq = m.seq_no
            WHERE rm.user_id = :userId
            ORDER BY lastMessageAt DESC
            """, nativeQuery = true)
    List<ChatroomSummaryView> loadUserChatroomSummaries(@Param("userId") Long userId);

    @Modifying
    @Query(value = """
            INSERT INTO room_members(room_id, user_id, last_ack)
            SELECT :roomId, :userId, last_seq
            FROM rooms
            WHERE id = :roomId
            """, nativeQuery = true)
    void addUserToRoom(@Param("userId") Long userId, @Param("roomId") Long roomId);
}
