package com.jason7599.cocatalk.user.relation;

import com.jason7599.cocatalk.user.UserInfo;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserRelationRepository {

    private final EntityManager em;

    public List<UserInfo> getContacts(Long userId) {
        // All this because I refuse to make contacts an entity
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
            SELECT
                u.id,
                u.username
            FROM contacts c
            JOIN users u ON c.contact_id = u.id
            WHERE c.user_id = :userId
            """)
                .setParameter("userId", userId)
                .getResultList();

        return rows.stream()
                .map(r -> new UserInfo(
                        ((Number) r[0]).longValue(),
                        (String) r[1]))
                .toList();
    }

    public List<UserInfo> getBlockedUsers(Long userId) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
                SELECT
                    u.id,
                    u.username
                FROM blocks b
                JOIN users u ON b.blocked_id = u.id
                WHERE b.user_id = :userId
                """)
                .setParameter("userId", userId)
                .getResultList();

        return rows.stream()
                .map(r -> new UserInfo(
                        ((Number) r[0]).longValue(),
                        (String) r[1]))
                .toList();
    }
}
