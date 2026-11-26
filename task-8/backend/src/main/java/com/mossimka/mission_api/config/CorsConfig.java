package com.mossimka.mission_api.config;

import java.util.Arrays;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origin-patterns}")
    private String[] allowedOriginPatterns;

    @Value("${app.cors.always-allowed-origin-patterns:}")
    private String[] alwaysAllowedOriginPatterns;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] originPatterns = Stream.concat(
                        Arrays.stream(allowedOriginPatterns),
                        Arrays.stream(alwaysAllowedOriginPatterns))
                .map(String::trim)
                .filter(pattern -> !pattern.isEmpty())
                .distinct()
                .toArray(String[]::new);

        registry.addMapping("/api/**")
                .allowedOriginPatterns(originPatterns)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
