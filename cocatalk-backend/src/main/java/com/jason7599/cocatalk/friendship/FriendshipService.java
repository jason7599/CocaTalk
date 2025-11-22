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
    public void addFriendRequest(Long senderId, String receiverName) {
        Long receiverId = userRepository.findByUsername(receiverName)
                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "This username does not exist"))
                .getId();

        if (senderId.equals(receiverId)) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Cannot friend yourself");
        }

        if (userRepository.friendshipExists(senderId, receiverId)) {
            throw new ApiError(HttpStatus.CONFLICT, "Already friends");
        }

        if (userRepository.friendRequestExists(senderId, receiverId)) {
            throw new ApiError(HttpStatus.CONFLICT, "Pending friend request already exists");
        }

        // Reverse friend request already exists - auto accept
        if (userRepository.friendRequestExists(receiverId, senderId)) {
            acceptFriendRequest(receiverId, senderId);
            return;
        }

        userRepository.addFriendRequest(senderId, receiverId);
    }

    @Transactional
    public UserInfo acceptFriendRequest(Long senderId, Long receiverId) {
        UserEntity receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Accept error - invalid receiver id"));

        userRepository.removeFriendRequest(senderId, receiverId);
        userRepository.addFriendship(senderId, receiverId);

        return new UserInfo(receiver);
    }

    @Transactional
    public void removeFriendRequst(Long senderId, Long receiverId) {
        userRepository.removeFriendRequest(senderId, receiverId);
    }

    public List<UserInfo> listFriends(Long userId) {
        return userRepository.listFriends(userId)
                .stream().map(UserInfo::new).toList();
    }

    public List<ReceiveFriendRequestDto> listPendingFriendRequests(Long userId) {
        return userRepository.listPendingFriendRequests(userId)
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

    @Transactional
    public void removeFriendship(Long userId, Long friendId) {
        userRepository.removeFriendship(userId, friendId);
    }
}
