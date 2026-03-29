package com.jason7599.cocatalk.dev;

import com.jason7599.cocatalk.chatroom.ChatroomService;
import com.jason7599.cocatalk.message.SendMessageRequest;
import com.jason7599.cocatalk.security.AuthService;
import com.jason7599.cocatalk.security.UserRegisterRequest;
import com.jason7599.cocatalk.user.UserInfo;
import com.jason7599.cocatalk.user.UserRepository;
import com.jason7599.cocatalk.user.relation.UserRelationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.*;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder {

    private static final String USER_PASSWORD = "1234";

    private static final float ADD_CONTACT_CHANCE = 0.25f;

    private static final Faker faker = new Faker(Locale.US);
    private static final Random random = new Random();

    private final UserRepository userRepository;
    private final AuthService authService;
    private final UserRelationService userRelationService;

    private final ChatroomService chatroomService;
    private final DevQueries devQueries;

    @Transactional
    public void seedUsers(int numUsers, int maxContactsPerUser, boolean reset) {
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

    private static final int MESSAGE_MAX_LENGTH = 300;

    @Transactional
    public void seedChatroom(long roomId, int numMessages) {
        List<UserInfo> members = devQueries.getMembers(roomId);

        if (members.isEmpty()) {
            throw new RuntimeException("room does not seem to exist");
        }

        while (numMessages-- > 0) {
            UserInfo member = members.get(random.nextInt(members.size()));

            chatroomService.sendMessage(
                    roomId,
                    member.userId(),
                    member.username(),
                    new SendMessageRequest(
                            faker.lorem().fixedString(random.nextInt(1, MESSAGE_MAX_LENGTH + 1)),
                            UUID.randomUUID()
                    )
            );
        }
    }
}
