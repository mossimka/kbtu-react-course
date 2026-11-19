package com.mossimka.mission_api.service;

import com.mossimka.mission_api.entity.AppUser;
import com.mossimka.mission_api.entity.AuthToken;
import com.mossimka.mission_api.repository.AuthTokenRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();

    private final AuthTokenRepository tokenRepository;

    @Value("${app.auth.token-ttl-hours:168}")
    private long tokenTtlHours;

    public record IssuedToken(String token, long expiresInSeconds) {}

    @Transactional
    public IssuedToken issue(AppUser user) {
        tokenRepository.deleteByExpiresAtBefore(Instant.now());

        String rawToken = generateToken();
        AuthToken token = new AuthToken();
        token.setTokenHash(hash(rawToken));
        token.setUser(user);
        token.setExpiresAt(Instant.now().plus(tokenTtlHours, ChronoUnit.HOURS));
        tokenRepository.save(token);

        return new IssuedToken(rawToken, tokenTtlHours * 3600);
    }

    @Transactional(readOnly = true)
    public Optional<AppUser> resolveUser(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }

        return tokenRepository.findByTokenHash(hash(rawToken))
                .filter(token -> token.getExpiresAt().isAfter(Instant.now()))
                .map(AuthToken::getUser);
    }

    @Transactional
    public void revokeAllFor(AppUser user) {
        tokenRepository.deleteByUser(user);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return ENCODER.encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return ENCODER.encodeToString(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
