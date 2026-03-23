package com.jason7599.cocatalk.chatroom;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ChatroomMembershipCache {

    private static final Duration TTL = Duration.ofMinutes(30);

    private final StringRedisTemplate redis;
    private final ChatroomRepository chatroomRepository;

    private String key(long roomId) {
        return "room:%d:members".formatted(roomId);
    }

    public Set<Long> fetch(long roomId) {
        String key = key(roomId);
        Set<String> raw = redis.opsForSet().members(key);

        // cache hit
        if (raw != null && !raw.isEmpty()) {
            /*
              Purposely not refreshing the TTL on read.
              However rare it might be, if cache invalidation fails,
              the TTL should guarantee "eventual correctness" for the cache
              even for hot rooms.
             */
            return raw.stream()
                    .map(Long::valueOf)
                    .collect(Collectors.toSet());
        }

        // cache miss flow
        Set<Long> memberIds = chatroomRepository.fetchChatroomMemberIds(roomId);

        assert(!memberIds.isEmpty());

        redis.opsForSet().add(
                key,
                memberIds.stream()
                        .map(String::valueOf)
                        .toArray(String[]::new)
        );
        redis.expire(key, TTL);

        return memberIds;
    }

    public void addMember(long roomId, long userId) {
        redis.opsForSet().add(key(roomId), String.valueOf(userId));
    }

    public void removeMember(long roomId, long userId) {
        redis.opsForSet().remove(key(roomId), String.valueOf(userId));
    }

    public void removeRoom(long roomId) {
        redis.delete(key(roomId));
    }
}
