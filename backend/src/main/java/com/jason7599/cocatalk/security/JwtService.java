package com.jason7599.cocatalk.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class JwtService {

    private static final Duration ACCESS_TOKEN_TTL = Duration.ofDays(7);

    private final UserDetailsService userDetailsService; // custom

    @Value("${jwt.secret}")
    private String secretBase64;

    private SecretKey signingKey;
    private JwtParser jwtParser;

    @PostConstruct
    void init() {
        byte[] keyBytes = Decoders.BASE64.decode(secretBase64);

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.jwtParser = Jwts.parser()
                .verifyWith(signingKey)
                .build();
    }

    public String generateToken(Long userId, String username) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ACCESS_TOKEN_TTL)))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    private Claims parseClaims(String token) {
        return jwtParser.parseSignedClaims(token).getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Authentication buildAuthentication(String token) {
        String username = extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    public String extractUsername(String token) {
        return parseClaims(token).get("username", String.class);
    }

    public String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
