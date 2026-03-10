package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.message.MessagePage;
import com.jason7599.cocatalk.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/{roomId}/bootstrap")
    public ChatroomBootstrapDto getMetadata(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long roomId
    ) {
        return chatroomService.bootstrap(roomId, userDetails.getId());
    }

    @GetMapping("/{roomId}/messages")
    public MessagePage loadMessages(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long roomId,
            @RequestParam(required = false) Long before,
            @RequestParam(required = false) Long after
    ) {
        boolean nullBefore = before == null;
        boolean nullAfter = after == null;

        if (nullBefore == nullAfter) {
            throw new ApiError(HttpStatus.BAD_REQUEST,
                    "Exactly one of 'before' or 'after' must be provided");
        }

        Long userId = userDetails.getId();

        if (!nullBefore) {
            return chatroomService.loadMessagesBefore(roomId, before, userId);
        }

        return chatroomService.loadMessagesAfter(roomId, after, userId);
    }
}
