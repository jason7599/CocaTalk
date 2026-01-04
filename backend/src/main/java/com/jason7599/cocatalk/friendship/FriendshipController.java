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
    @PostMapping("/requests")
    public ResponseEntity<FriendRequestSuccessDto> sendFriendRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CreateFriendRequestDto request
    ) {
        return ResponseEntity.ok(friendshipService.addFriendRequest(userDetails.getId(), request.receiverName()));
    }

    // accept friend request
    @PostMapping("/requests/{senderId}/accept")
    public ResponseEntity<UserInfo> acceptFriendRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long senderId
    ) {
        return ResponseEntity.ok(friendshipService.acceptFriendRequest(senderId, userDetails.getId()));
    }

    // delete friend request
    @DeleteMapping("/requests/{senderId}")
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

    @GetMapping("/requests/incoming")
    public ResponseEntity<List<ReceiveFriendRequestDto>> listReceivedRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(friendshipService.listReceivedRequests(userDetails.getId()));
    }

    @GetMapping("/requests/outgoing")
    public ResponseEntity<List<SentFriendRequestDto>> listSentRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(friendshipService.listSentRequests(userDetails.getId()));
    }

    @GetMapping("/requests/count")
    public ResponseEntity<Integer> countPendingRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(friendshipService.countPendingRequests(userDetails.getId()));
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
