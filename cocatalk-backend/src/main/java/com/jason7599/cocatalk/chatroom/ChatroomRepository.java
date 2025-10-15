package com.jason7599.cocatalk.chatroom;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatroomRepository extends JpaRepository<ChatroomEntity, Long> {

    @Query(value = """
            SELECT id
            FROM rooms JOIN room_members ON rooms.id = room_members.room_id
            WHERE room_members.user_id = :userId
            ORDER BY rooms.last_message_at DESC
            """, nativeQuery = true)
    List<Long> loadUserChatroomIds(@Param("userId") Long userId);
}
