package com.mossimka.mission_api.dto;

import com.mossimka.mission_api.entity.AppUser;

import java.time.Instant;

public record UserResponse(
    Long id,
    String name,
    String email,
    String role,
    Instant createdAt
) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}
