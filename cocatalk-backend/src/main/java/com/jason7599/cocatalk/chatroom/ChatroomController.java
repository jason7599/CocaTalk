package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/chatrooms")
@RequiredArgsConstructor
public class ChatroomController {

    private final ChatroomService chatroomService;

    @GetMapping
    public ResponseEntity<List<ChatroomSummary>> loadChatroomSummaries(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(chatroomService.loadChatroomSummaries(userDetails.getId()));
    }
}
