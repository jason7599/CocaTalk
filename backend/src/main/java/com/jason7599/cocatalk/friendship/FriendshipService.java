package com.jason7599.cocatalk.friendship;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.user.UserEntity;
import com.jason7599.cocatalk.user.UserInfo;
import com.jason7599.cocatalk.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final UserRepository userRepository;

    @Transactional
    public FriendRequestSuccessDto addFriendRequest(Long senderId, String receiverName) {
        UserEntity friend = userRepository.findByUsername(receiverName)
                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "This username does not exist"));
        Long friendId = friend.getId();

        if (senderId.equals(friendId)) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Cannot friend yourself");
        }

        if (userRepository.friendshipExists(senderId, friendId)) {
            throw new ApiError(HttpStatus.CONFLICT, "Already friends");
        }

        if (userRepository.friendRequestExists(senderId, friendId)) {
            throw new ApiError(HttpStatus.CONFLICT, "Pending friend request already exists");
        }

        // Reverse friend request already exists - auto accept
        if (userRepository.friendRequestExists(friendId, senderId)) {
            acceptFriendRequest(friendId, senderId);
            return new FriendRequestSuccessDto(new UserInfo(friend), FriendRequestSuccessType.AUTO_ACCEPT);
        }

        userRepository.addFriendRequest(senderId, friendId);
        return new FriendRequestSuccessDto(new UserInfo(friend), FriendRequestSuccessType.SENT);
    }

    @Transactional
    public UserInfo acceptFriendRequest(Long senderId, Long receiverId) {
        UserEntity sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Invalid sender id"));

        userRepository.removeFriendRequest(senderId, receiverId);
        userRepository.addFriendship(senderId, receiverId);

        return new UserInfo(sender);
    }

    @Transactional
    public void removeFriendRequst(Long senderId, Long receiverId) {
        userRepository.removeFriendRequest(senderId, receiverId);
    }

    public List<UserInfo> listFriends(Long userId) {
        return userRepository.listFriends(userId)
                .stream().map(UserInfo::new).toList();
    }

    // TODO: I hate using Object arrays. Maybe consider creating another View interface
    public List<ReceiveFriendRequestDto> listPendingRequests(Long userId) {
        return userRepository.listPendingRequests(userId)
                .stream().map(row -> {
                    Long senderId = ((Number) row[0]).longValue();
                    String senderName = (String) row[1];
                    Instant sentAt = ((Timestamp) row[2]).toInstant();

                    return new ReceiveFriendRequestDto(
                            senderId,
                            senderName,
                            sentAt
                    );
                }).toList();
    }
    
    public int countPendingRequests(Long userId) {
        return userRepository.countPendingRequests(userId);
    }

    @Transactional
    public void removeFriendship(Long userId, Long friendId) {
        userRepository.removeFriendship(userId, friendId);
    }
}
