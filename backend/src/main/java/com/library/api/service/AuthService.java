package com.library.api.service;

import com.library.api.config.SecurityProperties;
import com.library.api.dto.RegisterRequest;
import com.library.api.dto.AuthResponse;
import com.library.api.dto.LoginRequest;
import com.library.api.entity.User;
import com.library.api.entity.RefreshToken;
import com.library.api.mapper.UserMapper;
import com.library.api.exception.ApiException;
import com.library.api.exception.SessionRejectedException;
import org.springframework.http.HttpStatus;
import com.library.api.repository.*;
import com.library.api.security.TokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.util.*;
import java.nio.charset.StandardCharsets;
import java.security.*;

@Service
@Transactional(readOnly = true)
public class AuthService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder passwords;
    private final TokenService tokens;
    private final SecurityProperties properties;
    private final Clock clock;
    private final String unknownUserPasswordHash;

    public AuthService(UserRepository users, RefreshTokenRepository refreshTokens, PasswordEncoder passwords,
            TokenService tokens, SecurityProperties properties, Clock clock) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.passwords = passwords;
        this.tokens = tokens;
        this.properties = properties;
        this.clock = clock;
        unknownUserPasswordHash = passwords.encode(UUID.randomUUID().toString());
    }

    @Transactional
    public AuthSession register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.findByEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email já cadastrado.");
        }
        if (request.password().length() < 12 || request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("Senha deve conter pelo menos 12 caracteres e no máximo 72 bytes UTF-8.");
        }
        User user = users.saveAndFlush(new User(request.name().trim(), email, passwords.encode(request.password()), clock.instant()));
        return newSession(user, UUID.randomUUID());
    }

    @Transactional
    public AuthSession login(LoginRequest request) {
        Optional<User> found = users.findByEmail(request.email().trim().toLowerCase(Locale.ROOT));
        String passwordHash = found.map(User::getPasswordHash).orElse(unknownUserPasswordHash);
        boolean matches = request.password().getBytes(StandardCharsets.UTF_8).length <= 72
                && passwords.matches(request.password(), passwordHash);
        if (found.isEmpty() || !matches || !found.orElseThrow().isActive()) {
            throw unauthorized();
        }
        return newSession(found.orElseThrow(), UUID.randomUUID());
    }

    @Transactional(noRollbackFor = SessionRejectedException.class)
    public AuthSession refresh(String token) {
        if (token == null || token.isBlank() || token.length() > 128) {
            throw new SessionRejectedException();
        }
        RefreshToken stored = refreshTokens.lockByHash(hash(token)).orElseThrow(SessionRejectedException::new);
        if (stored.getRevokedAt() != null || !stored.getExpiresAt().isAfter(clock.instant()) || !stored.getUser().isActive()) {
            refreshTokens.revokeFamily(stored.getFamilyId(), clock.instant());
            throw new SessionRejectedException();
        }
        stored.revoke(clock.instant());
        return newSession(stored.getUser(), stored.getFamilyId());
    }

    @Transactional
    public void logout(String token) {
        if (token != null && !token.isBlank() && token.length() <= 128) {
            refreshTokens.lockByHash(hash(token)).ifPresent(stored -> refreshTokens.revokeFamily(stored.getFamilyId(), clock.instant()));
        }
    }

    private ApiException unauthorized() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "Credenciais ou sessão inválidas.");
    }

    private AuthSession newSession(User user, UUID family) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String refreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        refreshTokens.save(new RefreshToken(hash(refreshToken), user, family, clock.instant().plus(properties.refreshTokenTtl())));
        AuthResponse response = new AuthResponse(tokens.issue(user), "Bearer", properties.accessTokenTtl().toSeconds(), UserMapper.toResponse(user));
        return new AuthSession(response, refreshToken);
    }

    private static String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 indisponível na JVM.", exception);
        }
    }
}
