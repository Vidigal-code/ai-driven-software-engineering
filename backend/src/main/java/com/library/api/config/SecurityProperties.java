package com.library.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.time.Duration;
import java.util.List;

@ConfigurationProperties("library.security")
public record SecurityProperties(String jwtSecret, String issuer, String audience, Duration accessTokenTtl,
        Duration refreshTokenTtl, boolean cookieSecure, List<String> allowedOrigins) {
    public SecurityProperties {
        allowedOrigins = List.copyOf(allowedOrigins);
        if (issuer == null || issuer.isBlank() || audience == null || audience.isBlank()
                || accessTokenTtl.isNegative() || accessTokenTtl.isZero()
                || refreshTokenTtl.isNegative() || refreshTokenTtl.isZero()
                || allowedOrigins.isEmpty() || allowedOrigins.contains("*")) {
            throw new IllegalArgumentException("Configuração de segurança inválida.");
        }
    }
}
