package com.mossimka.mission_api.repository;

import com.mossimka.mission_api.entity.AppUser;
import com.mossimka.mission_api.entity.AuthToken;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {

    Optional<AuthToken> findByTokenHash(String tokenHash);

    void deleteByUser(AppUser user);

    void deleteByExpiresAtBefore(Instant cutoff);
}
