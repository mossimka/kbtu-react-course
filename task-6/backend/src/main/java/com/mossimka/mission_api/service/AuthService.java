package com.mossimka.mission_api.service;

import com.mossimka.mission_api.dto.AuthResponse;
import com.mossimka.mission_api.dto.LoginRequest;
import com.mossimka.mission_api.dto.RegisterRequest;
import com.mossimka.mission_api.dto.UserResponse;
import com.mossimka.mission_api.entity.AppUser;
import com.mossimka.mission_api.entity.Role;
import com.mossimka.mission_api.exception.ConflictException;
import com.mossimka.mission_api.exception.NotFoundException;
import com.mossimka.mission_api.exception.UnauthorizedException;
import com.mossimka.mission_api.repository.AppUserRepository;

import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService tokenService;

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists");
        }

        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("An account with this email already exists");
        }

        return issueToken(user);
    }

    public AuthResponse login(LoginRequest request) {
        AppUser user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return issueToken(user);
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(Long userId) {
        return userRepository.findById(userId)
                .map(UserResponse::from)
                .orElseThrow(() -> new NotFoundException("User with id " + userId + " not found"));
    }

    public void logout(Long userId) {
        userRepository.findById(userId).ifPresent(tokenService::revokeAllFor);
    }

    private AuthResponse issueToken(AppUser user) {
        AuthTokenService.IssuedToken issued = tokenService.issue(user);
        return new AuthResponse(issued.token(), "Bearer", issued.expiresInSeconds(), UserResponse.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
