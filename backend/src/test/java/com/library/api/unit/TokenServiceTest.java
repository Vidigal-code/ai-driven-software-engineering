package com.library.api.unit;

import com.library.api.config.SecurityProperties;
import com.library.api.entity.User;
import com.library.api.security.TokenService;
import org.junit.jupiter.api.Test;
import java.security.SecureRandom;
import java.time.*;
import java.util.Base64;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.springframework.security.oauth2.jwt.JwtException;

class TokenServiceTest {
    private final Clock clock = Clock.fixed(Instant.parse("2026-11-26T12:00:00Z"), ZoneOffset.UTC);
    private final SecurityProperties properties = properties();

    @Test
    void issuesVerifiableAccessToken() {
        TokenService tokens = new TokenService(properties, clock);
        User user = new User("Reader", "reader@example.test", "unused", clock.instant());
        var decoded = tokens.decode(tokens.issue(user));
        assertThat(decoded.getSubject()).isEqualTo(user.getId().toString());
        assertThat(decoded.getIssuer()).hasToString("https://library.test");
        assertThat(decoded.getAudience()).containsExactly("library-web");
        assertThat(decoded.getExpiresAt()).isEqualTo(clock.instant().plusSeconds(900));
    }

    @Test
    void rejectsExpiredAlteredAndWrongAudienceTokens() {
        TokenService tokens = new TokenService(properties, clock);
        String value = tokens.issue(new User("Reader", "reader@example.test", "unused", clock.instant()));
        TokenService expired = new TokenService(properties, Clock.offset(clock, Duration.ofHours(1)));
        assertThatThrownBy(() -> expired.decode(value)).isInstanceOf(JwtException.class);
        String alteredToken = value.substring(0, value.length() - 8) + "modified";
        assertThatThrownBy(() -> tokens.decode(alteredToken))
                .isInstanceOf(JwtException.class);
        var wrongAudience = new SecurityProperties(properties.jwtSecret(), properties.issuer(), "another-app",
                properties.accessTokenTtl(), properties.refreshTokenTtl(), false, properties.allowedOrigins());
        var audienceVerifier = new TokenService(wrongAudience, clock);
        assertThatThrownBy(() -> audienceVerifier.decode(value)).isInstanceOf(JwtException.class);
        var wrongIssuer = new SecurityProperties(properties.jwtSecret(), "https://other.test", properties.audience(),
                properties.accessTokenTtl(), properties.refreshTokenTtl(), false, properties.allowedOrigins());
        var issuerVerifier = new TokenService(wrongIssuer, clock);
        assertThatThrownBy(() -> issuerVerifier.decode(value)).isInstanceOf(JwtException.class);
    }

    private SecurityProperties properties() {
        byte[] secret = new byte[32];
        new SecureRandom().nextBytes(secret);
        return new SecurityProperties(Base64.getEncoder().encodeToString(secret), "https://library.test", "library-web",
                Duration.ofMinutes(15), Duration.ofDays(7), false, List.of("http://localhost:3000"));
    }
}
