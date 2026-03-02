package com.jason7599.cocatalk.dev;

import net.datafaker.Faker;

import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.function.Supplier;

public class FakeUsernameGenerator {

    private static final Faker faker = new Faker(Locale.US);
    private static final Random random = new Random();

    private static final List<Supplier<String>> WORD_PROVIDERS = List.of(
            () -> faker.hacker().noun(),
            () -> faker.hacker().adjective(),
            () -> faker.animal().name(),
            () -> faker.color().name(),
            () -> faker.space().planet(),
            () -> faker.superhero().prefix(),
            () -> faker.name().firstName(),
            () -> faker.name().lastName(),
            () -> faker.funnyName().name(),
            () -> faker.dog().name(),
            () -> faker.cat().name(),
            () -> faker.food().ingredient(),
            () -> faker.weather().description(),
            () -> faker.lorem().word()
    );

    public static String generate() {

        String word1 = randomWord();
        String word2 = randomWord();

        int number = faker.number().numberBetween(1, 9999);

        String username = switch (random.nextInt(6)) {
            case 0 -> // tiger_hacker
                    word1 + "_" + word2;
            case 1 -> // tiger.hacker
                    word1 + "." + word2;
            case 2 -> // tigerhacker
                    word1 + word2;
            case 3 -> // tiger42
                    word1 + number;
            case 4 -> // tiger_hacker42
                    word1 + "_" + word2 + number;
            default -> // tiger42_hacker
                    word1 + number + "_" + word2;
        };

        username = username.toLowerCase();

        // enforce allowed characters
        username = username.replaceAll("[^a-z0-9_.]", "");

        // enforce max length
        if (username.length() > 25) {
            username = username.substring(0, 25);
        }

        // enforce min length
        if (username.length() < 3) {
            username += faker.number().digits(2);
        }

        return username;
    }

    private static String randomWord() {
        String word = WORD_PROVIDERS.get(random.nextInt(WORD_PROVIDERS.size())).get();
        return sanitize(word);
    }

    private static String sanitize(String word) {
        word = word.replaceAll("[^a-zA-Z0-9]", "");

        if (word.length() > 12) {
            word = word.substring(0, 12);
        }

        return word;
    }
}