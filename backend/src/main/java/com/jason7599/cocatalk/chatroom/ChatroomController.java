package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessagePage;
import com.jason7599.cocatalk.security.CustomUserDetails;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chatrooms")
@RequiredArgsConstructor
public class ChatroomController {

    private static final int MESSAGE_FETCH_DEFAULT_LIMIT = 30;

    private final ChatroomService chatroomService;

    @GetMapping
    public ResponseEntity<List<ChatroomSummary>> loadChatroomSummaries(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(chatroomService.loadChatroomSummaries(userDetails.getId()));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<MessagePage> loadMessages(
            @PathVariable Long roomId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "" + MESSAGE_FETCH_DEFAULT_LIMIT) @Min(1) @Max(100) int limit
    ) {
        return ResponseEntity.ok(chatroomService.loadMessages(roomId, cursor, limit));
    }

    @GetMapping("/{roomId}/members")
    public ResponseEntity<List<ChatMemberInfo>> getMembersInfo(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatroomService.getMembersInfo(roomId));
    }
}
