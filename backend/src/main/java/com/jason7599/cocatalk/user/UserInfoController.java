package com.jason7599.cocatalk.user;

import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserInfoController {

    private final UserInfoService userInfoService;

    @GetMapping("/me")
    public ResponseEntity<UserInfo> getUserInfo(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userInfoService.getUserInfo(userDetails.getId()));
    }
}
