package com.jason7599.cocatalk.friendship;

import com.jason7599.cocatalk.security.CustomUserDetails;
import com.jason7599.cocatalk.user.UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    // add friend request
    @PostMapping("/request")
    public ResponseEntity<Void> sendFriendRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody SendFriendRequestDto request
    ) {
        friendshipService.addFriendRequest(userDetails.getId(), request.receiverName());
        return ResponseEntity.ok().build();
    }

    // accept friend request
    @PostMapping("/request/{senderId}/accept")
    public ResponseEntity<UserInfo> acceptFriendRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long senderId
    ) {
        return ResponseEntity.ok(friendshipService.acceptFriendRequest(senderId, userDetails.getId()));
    }

    // delete friend request
    @DeleteMapping("/request/{senderId}")
    public ResponseEntity<Void> removeFriendRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long senderId
    ) {
        friendshipService.removeFriendRequst(senderId, userDetails.getId());
        return ResponseEntity.ok().build();
    }

    // list friends
    @GetMapping
    public ResponseEntity<List<UserInfo>> listFriends(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(friendshipService.listFriends(userDetails.getId()));
    }

    // list pending friend requests
    @GetMapping("/requests")
    public ResponseEntity<List<ReceiveFriendRequestDto>> listPendingFriendRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(friendshipService.listPendingFriendRequests(userDetails.getId()));
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriendship(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long friendId
    ) {
        friendshipService.removeFriendship(userDetails.getId(), friendId);
        return ResponseEntity.ok().build();
    }
}
