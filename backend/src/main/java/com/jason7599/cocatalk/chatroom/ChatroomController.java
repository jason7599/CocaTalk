package com.jason7599.cocatalk.chatroom;

import com.jason7599.cocatalk.message.MessageDto;
import com.jason7599.cocatalk.message.MessagePage;
import com.jason7599.cocatalk.message.SendMessageRequest;
import com.jason7599.cocatalk.security.CustomUserDetails;
import jakarta.validation.Valid;
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
            @PathVariable long roomId
    ) {
        return chatroomService.getChatroomSummary(roomId, userDetails.getId());
    }

    @PostMapping("/direct")
    public long resolveDirectChatroom(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody DirectChatRequest request
    ) {
        return chatroomService.resolveDirectChatroom(userDetails.getId(), request.targetUserId());
    }

    @GetMapping("/{roomId}/bootstrap")
    public ChatroomBootstrapDto bootstrap(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable long roomId
    ) {
        return chatroomService.bootstrap(roomId, userDetails.getId());
    }

    @GetMapping("/{roomId}/messages")
    public MessagePage loadOlderMessages(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable long roomId,
            @RequestParam long cursor
    ) {
        return chatroomService.loadOlderMessages(roomId, userDetails.getId(), cursor);
    }

    @PostMapping("/{roomId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageDto sendMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable long roomId,
            @RequestBody @Valid SendMessageRequest request
    ) {
        return chatroomService.sendMessage(roomId, userDetails.getId(), userDetails.getUsername(), request);
    }
}
