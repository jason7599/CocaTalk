package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chatrooms")
@RequiredArgsConstructor
public class ChatroomController {

    private final ChatroomService chatroomService;

    @PostMapping("/create")
    public ResponseEntity<ChatroomResponse> createRoom(@RequestBody ChatroomCreateRequest request,
                                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                chatroomService.createRoom(userDetails.getId(), request));
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> loadChatroomIds(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(chatroomService.loadChatroomIds(userDetails.getId()));
    }
}
