package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.security.CustomUserDetails;
import com.jason7599.cocatalk.user.relation.UserRelationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final SessionBootstrapService sessionBootstrapService;
    private final UserRelationService userRelationService;

    @GetMapping("/me")
    public UserInfo getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return userService.getUserInfo(userDetails.getId());
    }

    @GetMapping("/me/bootstrap")
    public UserBootstrapDto bootstrap(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return sessionBootstrapService.bootstrap(userDetails.getId());
    }

    @GetMapping("/search")
    public List<UserInfo> searchUsers(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String query
    ) {
        return userService.searchUsers(query, userDetails.getId());
    }

    @PostMapping("/contacts/{targetId}")
    @ResponseStatus(HttpStatus.CREATED)
    public UserInfo addContact(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("targetId") Long targetId
    ) {
        return userRelationService.addContact(userDetails.getId(), targetId);
    }

    @DeleteMapping("/contacts/{targetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeContact(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("targetId") Long targetId
    ) {
        userRelationService.removeContact(userDetails.getId(), targetId);
    }

    @PostMapping("/block/{targetId}")
    @ResponseStatus(HttpStatus.CREATED)
    public UserInfo addBlock(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("targetId") Long targetId
    ) {
        return userRelationService.addBlock(userDetails.getId(), targetId);
    }

    @DeleteMapping("/block/{targetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeBlock(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("targetId") Long targetId
    ) {
        userRelationService.removeBlock(userDetails.getId(), targetId);
    }
}
