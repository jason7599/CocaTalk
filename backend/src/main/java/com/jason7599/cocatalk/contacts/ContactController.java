package com.jason7599.cocatalk.contacts;

import com.jason7599.cocatalk.security.CustomUserDetails;
import com.jason7599.cocatalk.user.UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<UserInfo> addContact(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody AddContactRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contactService.addContact(userDetails.getId(), request));
    }

    // delete incoming friend request
    @DeleteMapping("/{contactId}")
    public ResponseEntity<Void> removeContact(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long contactId
    ) {
        contactService.removeContact(userDetails.getId(), contactId);
        return ResponseEntity.noContent().build();
    }

    // list friends
    @GetMapping
    public ResponseEntity<List<UserInfo>> listContacts(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(contactService.listContacts(userDetails.getId()));
    }
}
