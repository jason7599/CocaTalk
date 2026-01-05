package com.jason7599.cocatalk.friendship;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.user.UserEntity;
import com.jason7599.cocatalk.user.UserInfo;
import com.jason7599.cocatalk.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final UserRepository userRepository;

    @Transactional
    public FriendRequestSentResult addFriendRequest(Long senderId, String receiverName) {
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
            return new FriendRequestSentResult(FriendRequestSentResultType.AUTO_ACCEPT, null, new UserInfo(friend));
        }

        userRepository.addFriendRequest(senderId, friendId);
        return new FriendRequestSentResult(FriendRequestSentResultType.SENT, new SentFriendRequestDto(friendId, friend.getUsername(), Instant.now()), new UserInfo(friend));
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

    public List<ReceiveFriendRequestDto> listReceivedRequests(Long userId) {
        return userRepository.listReceivedRequests(userId)
                .stream().map(v -> new ReceiveFriendRequestDto(
                        v.getId(),
                        v.getUsername(),
                        v.getSentAt().toInstant()
                )).toList();
    }

    public List<SentFriendRequestDto> listSentRequests(Long userId) {
        return userRepository.listSentRequests(userId)
                .stream().map(v -> new SentFriendRequestDto(
                        v.getId(),
                        v.getUsername(),
                        v.getSentAt().toInstant()
                )).toList();
    }
    
    public int countPendingRequests(Long userId) {
        return userRepository.countPendingRequests(userId);
    }

    @Transactional
    public void removeFriendship(Long userId, Long friendId) {
        userRepository.removeFriendship(userId, friendId);
    }
}
