package com.jason7599.cocatalk.dev;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("dev")
@RequestMapping("/dev")
@RequiredArgsConstructor
public class DevController {

    private final DataSeeder seeder;

    @GetMapping("/hi")
    public String test() {
        return "hi";
    }

    @PostMapping("/seed")
    public void seed(
            @RequestParam(defaultValue = "150") int numUsers,
            @RequestParam(defaultValue = "30") int maxContactsPerUser,
            @RequestParam(defaultValue = "false") boolean reset
    ) {
        seeder.seed(numUsers, maxContactsPerUser, reset);
    }
}
