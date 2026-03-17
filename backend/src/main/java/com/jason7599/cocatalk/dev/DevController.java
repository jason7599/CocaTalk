package com.jason7599.cocatalk.dev;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@Profile("dev")
@RequestMapping("/dev")
@RequiredArgsConstructor
public class DevController {

    private final DataSeeder seeder;

    @PostMapping("/seed/users")
    public void seedUsers(
            @RequestParam(defaultValue = "150") int numUsers,
            @RequestParam(defaultValue = "30") int maxContactsPerUser,
            @RequestParam(defaultValue = "false") boolean reset
    ) {
        seeder.seedUsers(numUsers, maxContactsPerUser, reset);
    }

    @PostMapping("/seed/rooms/{roomId}")
    public void seedChatroom(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "150") int numMessages
    ) {
        seeder.seedChatroom(roomId, numMessages);
    }
}
