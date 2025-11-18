package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.exception.ApiError;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final UserRepository userRepository;

    @Transactional
    public void addFriendRequest(Long senderId, String receiverName) {
        Long receiverId = userRepository.findByUsername(receiverName)
                .orElseThrow(() -> new UsernameNotFoundException("This username does not exist"))
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

        if (userRepository.friendRequestExists(receiverId, senderId)) {
            acceptFriendRequest(receiverId, senderId);
            return;
        }

        userRepository.addFriendRequest(senderId, receiverId);
    }

    @Transactional
    public void acceptFriendRequest(Long senderId, Long receiverId) {
        userRepository.removeFriendRequest(senderId, receiverId);
        userRepository.addFriendship(senderId, receiverId);
    }
}
