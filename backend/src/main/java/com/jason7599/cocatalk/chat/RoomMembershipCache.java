package com.jason7599.cocatalk.chat;

import com.jason7599.cocatalk.chatroom.ChatroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomMembershipCache {

    private final StringRedisTemplate redis;
    private final ChatroomService chatroomService;

    private String key(Long roomId) {
        return "room:%d:members".formatted(roomId);
    }

    public void addMember(Long roomId, Long userId) {
        redis.opsForSet().add(key(roomId), userId.toString());
    }

    public void removeMember(Long roomId, Long userId) {
        redis.opsForSet().remove(key(roomId), userId.toString());
    }

    public Set<Long> getMembers(Long roomId) {
        Set<String> cache = redis.opsForSet().members(key(roomId));
        if (cache != null) {
            return cache.stream()
                    .map(Long::valueOf)
                    .collect(Collectors.toUnmodifiableSet());
        }

        Set<Long> res = chatroomService.getMembersId(roomId);
        redis.opsForSet().add(key(roomId), res.stream().map(String::valueOf).toArray(String[]::new));
        return res;
    }
}
