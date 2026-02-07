package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserInfo> getUserInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserInfo(userDetails.getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserInfo>> searchByDiscriminator(@RequestParam("q") String discriminator) {
        if (discriminator.length() < 3) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(userService.searchByDiscriminator(discriminator));
    }
}
