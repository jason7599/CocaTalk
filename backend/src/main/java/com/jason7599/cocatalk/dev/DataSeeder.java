package com.jason7599.cocatalk.dev;

import com.jason7599.cocatalk.security.AuthService;
import com.jason7599.cocatalk.security.UserRegisterRequest;
import com.jason7599.cocatalk.user.UserRepository;
import com.jason7599.cocatalk.user.relation.UserRelationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder {

    private static final String USER_PASSWORD = "1234";

    private static final float ADD_CONTACT_CHANCE = 0.25f;

    private static final Random random = new Random();

    private final UserRepository userRepository;
    private final AuthService authService;
    private final UserRelationService userRelationService;

    public void seed(int numUsers, int maxContactsPerUser, boolean reset) {
        try {
            log.debug("Starting dev data seeder...");

            if (reset) {
                userRepository.deleteAll();
            }

            List<Long> createdUserIds = new ArrayList<>(numUsers);
            Set<String> usedUsernames = userRepository.findAllUsernames();

            for (int i = 0; i < numUsers; i++) {
                String username;
                do {
                    username = FakeUsernameGenerator.generate();
                } while (!usedUsernames.add(username));

                long userId = authService.register(new UserRegisterRequest(username,USER_PASSWORD));
                createdUserIds.add(userId);
            }

            for (long userId : createdUserIds) {
                for (int idIdx = 0, created = 0; idIdx < createdUserIds.size() && created < maxContactsPerUser;) {
                    if (userId == createdUserIds.get(idIdx) || random.nextFloat() > ADD_CONTACT_CHANCE) {
                        idIdx++;
                        continue;
                    }

                    userRelationService.addContact(userId, createdUserIds.get(idIdx));
                    created++;
                    idIdx += random.nextInt(Math.max(1, numUsers / 20)) + 1;
                }
            }

        } catch (Exception e) {
            log.error("Something went wrong", e);
        } finally {
            log.debug("Terminating dev data seeder");
        }
    }
}
