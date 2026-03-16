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

    public List<UserInfo> getContacts(long userId) {
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

    /**
     * @throws DataIntegrityViolationException When already contacts
     */
    public void addContact(long userId, long targetId) {
        em.createNativeQuery("""
                INSERT INTO contacts (user_id, contact_id)
                VALUES (:userId, :targetId)
                """)
                .setParameter("userId", userId)
                .setParameter("targetId", targetId)
                .executeUpdate();
    }

    public void removeContact(long userId, long targetId) {
        em.createNativeQuery("""
                DELETE FROM contacts
                WHERE user_id = :userId AND contact_id = :targetId
                """)
                .setParameter("userId", userId)
                .setParameter("targetId", targetId)
                .executeUpdate();
    }

    public List<UserInfo> getBlockedUsers(long userId) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
                SELECT
                    u.id,
                    u.username
                FROM blocks b
                JOIN users u ON b.blocked_id = u.id
                WHERE b.user_id = :userId
                ORDER BY u.username
                """)
                .setParameter("userId", userId)
                .getResultList();

        return rows.stream()
                .map(r -> new UserInfo(
                        ((Number) r[0]).longValue(),
                        (String) r[1]))
                .toList();
    }

    public void addBlock(long userId, long targetId) {
        em.createNativeQuery("""
                INSERT INTO blocks (user_id, blocked_id)
                VALUES (:userId, :targetId)
                """)
                .setParameter("userId", userId)
                .setParameter("targetId", targetId)
                .executeUpdate();
    }

    public void removeBlock(long userId, long targetId) {
        em.createNativeQuery("""
                DELETE FROM blocks
                WHERE user_id = :userId AND blocked_id = :targetId
                """)
                .setParameter("userId", userId)
                .setParameter("targetId", targetId)
                .executeUpdate();
    }

    public boolean hasBlocked(long blockerId, long blockeeId) {
        return (Boolean) em.createNativeQuery("""
                SELECT EXISTS (
                    SELECT 1
                    FROM blocks
                    WHERE user_id = :blockerId AND blocked_id = :blockeeId
                )
                """)
                .setParameter("blockerId", blockerId)
                .setParameter("blockeeId", blockeeId)
                .getSingleResult();
    }
}
