package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chatrooms")
@RequiredArgsConstructor
public class ChatroomController {

    private final ChatroomService chatroomService;

    @GetMapping
    public ResponseEntity<List<ChatroomSummary>> loadChatroomSummaries(@AuthenticationPrincipal CustomUserDetails userDetails) {
        System.out.println(SecurityContextHolder.getContext().getAuthentication().getName());
        return ResponseEntity.ok(chatroomService.loadChatroomSummaries(userDetails.getId()));
    }

    @PostMapping("/direct")
    public ResponseEntity<ChatroomSummary> getOrCreateDirectChatroom(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                     @RequestBody DirectChatroomRequest request) {
        return ResponseEntity.ok(chatroomService.getOrCreateDirectChatroom(userDetails.getId(), request.otherUserId()));
    }
}
