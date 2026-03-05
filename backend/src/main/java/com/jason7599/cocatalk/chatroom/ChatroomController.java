package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatroomController {

    private final ChatroomService chatroomService;

    @GetMapping("/{roomId}")
    public ChatroomSummary getChatroomSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long roomId
    ) {
        return chatroomService.getChatroomSummary(roomId, userDetails.getId());
    }

    @PostMapping("/direct")
    public Long resolveDirectChatroom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody DirectChatRequest request
    ) {
        return chatroomService.resolveDirectChatroom(userDetails.getId(), request.targetUserId());
    }

    @GetMapping("/{roomId}/meta")
    public ChatroomMeta getMetadata(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long roomId
    ) {
        return chatroomService.fetchMetadata(roomId, userDetails.getId());
    }
}
