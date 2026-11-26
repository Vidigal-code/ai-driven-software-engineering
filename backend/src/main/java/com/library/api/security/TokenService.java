package com.library.api.security;

import com.library.api.config.SecurityProperties;
import com.library.api.entity.User;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.stereotype.Service;
import java.time.Clock;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import javax.crypto.spec.SecretKeySpec;

@Service
public class TokenService implements JwtDecoder {
    private final SecurityProperties properties;
    private final Clock clock;
    private final JwtEncoder encoder;
    private final NimbusJwtDecoder decoder;

    public TokenService(SecurityProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
        byte[] keyBytes = Base64.getDecoder().decode(properties.jwtSecret());
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET precisa de pelo menos 32 bytes aleatórios em base64.");
        }
        var key = new SecretKeySpec(keyBytes, "HmacSHA256");
        encoder = NimbusJwtEncoder.withSecretKey(key).algorithm(MacAlgorithm.HS256).build();
        decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        JwtTimestampValidator timestamp = new JwtTimestampValidator(Duration.ZERO);
        timestamp.setClock(clock);
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(timestamp,
                new JwtIssuerValidator(properties.issuer()), new JwtAudienceValidator(properties.audience())));
    }

    public String issue(User user) {
        var now = clock.instant();
        var claims = JwtClaimsSet.builder().subject(user.getId().toString()).issuer(properties.issuer())
                .audience(List.of(properties.audience())).issuedAt(now).expiresAt(now.plus(properties.accessTokenTtl()))
                .id(UUID.randomUUID().toString()).claim("role", user.getRole().name()).build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }

    @Override
    public Jwt decode(String token) { return decoder.decode(token); }
}
