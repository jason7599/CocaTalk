package com.jason7599.cocatalk.chat;

import com.jason7599.cocatalk.chatroom.ChatroomRepository;
import com.jason7599.cocatalk.chatroom.ChatroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomMembershipService {

    private static final Duration TTL = Duration.ofHours(2);
    private static final double TTL_REFRESH_CHANCE_ON_READ = 0.01;

    private final StringRedisTemplate redis;
    private final ChatroomRepository chatroomRepository;

    private String key(Long roomId) {
        return "chat:room:%d:members".formatted(roomId);
    }

    public void addMember(Long roomId, Long userId) {
        redis.opsForSet().add(key(roomId), userId.toString());
    }

    public void removeMember(Long roomId, Long userId) {
        redis.opsForSet().remove(key(roomId), userId.toString());
    }

    public Set<Long> loadMemberIds(Long roomId) {
        String k = key(roomId);

        Set<String> cache = redis.opsForSet().members(k);

        // null check kinda redundant - Redis should return an empty set if the key is not present
        // just to keep compiler happy
        if (cache != null && !cache.isEmpty()) {
            maybeRefreshTTL(k);
            return cache.stream()
                    .map(Long::valueOf)
                    .collect(Collectors.toUnmodifiableSet());
        }

        Set<Long> res = chatroomRepository.getMembersId(roomId);
        if (!res.isEmpty()) {
            redis.opsForSet().add(k, res.stream().map(String::valueOf).toArray(String[]::new));
            redis.expire(k, TTL);
        }

        return res;
    }

    private void maybeRefreshTTL(String key) {
        if (ThreadLocalRandom.current().nextDouble() <= TTL_REFRESH_CHANCE_ON_READ) {
            redis.expire(key, TTL);
        }
    }
}
