package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessagePage;
import com.jason7599.cocatalk.message.MessageService;
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
    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<ChatroomSummary>> loadChatroomSummaries(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(chatroomService.loadChatroomSummaries(userDetails.getId()));
    }

    @PostMapping("/direct")
    public ResponseEntity<ChatroomSummary> getOrCreateDirectChatroom(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                     @RequestBody DirectChatroomRequest request) {
        return ResponseEntity.ok(chatroomService.getOrCreateDirectChatroom(userDetails.getId(), request.otherUserId()));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<MessagePage> loadMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "" + Long.MAX_VALUE) Long cursor,
            @RequestParam(defaultValue = "" + MESSAGE_FETCH_DEFAULT_LIMIT) @Min(1) @Max(100) int limit
    ) {
        return ResponseEntity.ok(messageService.loadMessages(roomId, cursor, limit));
    }
}
