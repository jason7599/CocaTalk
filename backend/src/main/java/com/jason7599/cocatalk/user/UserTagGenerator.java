package com.jason7599.cocatalk.user;

import java.security.SecureRandom;

public final class UserTagGenerator {

    // crockford style base32
    private static final String ALPHABETS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int TAG_LENGTH = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private UserTagGenerator() {}

    public static String generate() {
        StringBuilder sb = new StringBuilder(TAG_LENGTH);
        for (int i = 0; i < TAG_LENGTH; i++) {
            sb.append(ALPHABETS.charAt(RANDOM.nextInt(ALPHABETS.length())));
        }
        return sb.toString();
    }
}
