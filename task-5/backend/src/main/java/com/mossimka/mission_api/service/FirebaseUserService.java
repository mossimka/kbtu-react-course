package com.mossimka.mission_api.service;

import com.mossimka.mission_api.entity.AppUser;
import com.mossimka.mission_api.entity.Role;
import com.mossimka.mission_api.repository.AppUserRepository;

import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Bridges Firebase identities to the local {@link AppUser} table. The first
 * authenticated request creates (or links) a local profile so the rest of the
 * application can keep using the existing AppUser principal.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class FirebaseUserService {

    private final JwtDecoder firebaseJwtDecoder;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.firebase.project-id:}")
    private String projectId;

    @Transactional
    public Optional<AppUser> resolveUser(String rawToken) {
        if (projectId == null || projectId.isBlank() || rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }

        try {
            Jwt jwt = firebaseJwtDecoder.decode(rawToken);
            return Optional.of(upsert(jwt));
        } catch (JwtException | IllegalArgumentException exception) {
            log.debug("Rejected Firebase token: {}", exception.getMessage());
            return Optional.empty();
        }
    }

    private AppUser upsert(Jwt jwt) {
        String uid = jwt.getSubject();
        if (uid == null || uid.isBlank()) {
            throw new JwtException("Firebase token has no subject");
        }

        Optional<AppUser> existing = userRepository.findByFirebaseUid(uid);
        if (existing.isPresent()) {
            return existing.get();
        }

        String email = normalizeEmail(jwt.getClaimAsString("email"));
        String name = displayName(jwt, email);

        if (!email.isBlank()) {
            Optional<AppUser> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                AppUser user = byEmail.get();
                user.setFirebaseUid(uid);
                if (user.getName() == null || user.getName().isBlank()) {
                    user.setName(name);
                }
                return userRepository.save(user);
            }
        }

        AppUser user = new AppUser();
        user.setFirebaseUid(uid);
        user.setEmail(email.isBlank() ? uid + "@firebase.local" : email);
        user.setName(name);
        // Firebase owns the credential; this random value only satisfies the
        // non-null column used by the backend token fallback.
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return "";
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return normalized.length() <= 255 ? normalized : normalized.substring(0, 255);
    }

    private String displayName(Jwt jwt, String email) {
        String name = jwt.getClaimAsString("name");
        if (name == null || name.isBlank()) {
            name = email.isBlank() ? "Mission Operator" : email.substring(0, email.indexOf('@'));
        }
        name = name.trim();
        return name.length() <= 80 ? name : name.substring(0, 80);
    }
}
