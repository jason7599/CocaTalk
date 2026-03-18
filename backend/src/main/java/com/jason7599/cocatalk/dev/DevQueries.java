package com.jason7599.cocatalk.dev;

import com.jason7599.cocatalk.user.UserEntity;
import com.jason7599.cocatalk.user.UserInfo;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Profile("dev")
@Repository
public interface DevQueries extends JpaRepository<UserEntity, Long> {

    @Query(value = """
            SELECT
                user_id AS userId,
                username
            FROM room_members rm JOIN users u ON rm.user_id = u.id
            WHERE room_id = :roomId
            """, nativeQuery = true)
    List<UserInfo> getMembers(@Param("roomId") long roomId);

    @Modifying
    @Query(value = """
            UPDATE rooms
            SET last_seq = 0
            WHERE id = :roomId
            """, nativeQuery = true)
    void resetLastSeq(@Param("roomId") long roomId);

    @Modifying
    @Query(value = """
            DELETE
            FROM messages
            WHERE room_id = :roomId
            """, nativeQuery = true)
    void deleteRoomMessages(@Param("roomId") long roomId);
}
