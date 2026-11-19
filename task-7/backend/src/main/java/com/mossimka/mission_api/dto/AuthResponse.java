package com.mossimka.mission_api.dto;

public record AuthResponse(
    String token,
    String tokenType,
    long expiresInSeconds,
    UserResponse user
) {}
