package com.mossimka.mission_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

/**
 * Firebase ID tokens are RS256 JWTs signed by Google. Verifying them against
 * Google's public keys keeps Google sign-in working without storing a service
 * account secret on the API server.
 */
@Configuration
public class FirebaseConfig {

    private static final String JWK_SET_URI =
            "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

    @Bean
    public JwtDecoder firebaseJwtDecoder(@Value("${app.firebase.project-id:}") String projectId) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(JWK_SET_URI).build();

        if (projectId != null && !projectId.isBlank()) {
            OAuth2TokenValidator<Jwt> issuer =
                    JwtValidators.createDefaultWithIssuer("https://securetoken.google.com/" + projectId);
            OAuth2TokenValidator<Jwt> audience = jwt -> jwt.getAudience().contains(projectId)
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(
                            new OAuth2Error("invalid_token", "Invalid Firebase audience", null));
            decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(issuer, audience));
        }

        return decoder;
    }
}
