package com.library.api.unit;

import com.library.api.config.SecurityProperties;
import com.library.api.dto.RegisterRequest;
import com.library.api.dto.LoginRequest;
import com.library.api.entity.Role;
import com.library.api.entity.User;
import com.library.api.entity.RefreshToken;
import com.library.api.exception.ApiException;
import com.library.api.service.AuthSession;
import com.library.api.repository.*;
import com.library.api.security.TokenService;
import com.library.api.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.security.SecureRandom;
import java.time.*;
import java.util.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final RefreshTokenRepository refresh = mock(RefreshTokenRepository.class);
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder(4);
    private final Clock clock = Clock.fixed(Instant.parse("2026-11-26T12:00:00Z"), ZoneOffset.UTC);
    private final SecurityProperties properties = properties();
    private final TokenService tokens = new TokenService(properties, clock);
    private final AuthService service = new AuthService(users, refresh, passwords, tokens, properties, clock);

    @Test
    void register() {
        Map<String, User> stored = new HashMap<>();
        when(users.saveAndFlush(any())).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            stored.put(user.getEmail(), user);
            return user;
        });
        var session = service.register(new RegisterRequest(" Reader ", "READER@example.test", "long-passphrase-test"));
        assertThat(session.response().user().role()).isEqualTo(Role.READER);
        assertThat(session.response().user().email()).isEqualTo("reader@example.test");
        assertThat(session.refreshToken()).hasSizeGreaterThanOrEqualTo(43);
        assertThat(passwords.matches("long-passphrase-test", stored.get("reader@example.test").getPasswordHash())).isTrue();
        assertThat(tokens.decode(session.response().accessToken()).getSubject()).isEqualTo(session.response().user().id().toString());
    }

    @Test
    void login() {
        User user = new User("Reader", "reader@example.test", passwords.encode("long-passphrase-test"), clock.instant());
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        var session = service.login(new LoginRequest("READER@example.test", "long-passphrase-test"));
        assertThat(session.response().user().id()).isEqualTo(user.getId());
        assertThat(tokens.decode(session.response().accessToken()).getSubject()).isEqualTo(user.getId().toString());
    }

    @Test
    void rotatesRefreshAndRejectsReplay() {
        Map<String, RefreshToken> stored = new HashMap<>();
        when(refresh.save(any())).thenAnswer(invocation -> {
            RefreshToken token = invocation.getArgument(0);
            stored.put(token.getTokenHash(), token);
            return token;
        });
        when(refresh.lockByHash(any())).thenAnswer(invocation -> Optional.ofNullable(stored.get(invocation.getArgument(0))));
        when(refresh.revokeFamily(any(), any())).thenAnswer(invocation -> {
            UUID family = invocation.getArgument(0);
            stored.values().stream().filter(token -> token.getFamilyId().equals(family)).forEach(token -> token.revoke(clock.instant()));
            return 1;
        });
        User user = new User("Reader", "reader@example.test", passwords.encode("long-passphrase-test"), clock.instant());
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        AuthSession initial = service.login(new LoginRequest(user.getEmail(), "long-passphrase-test"));
        AuthSession rotated = service.refresh(initial.refreshToken());
        assertThat(rotated.refreshToken()).isNotEqualTo(initial.refreshToken());
        String initialToken = initial.refreshToken();
        String rotatedToken = rotated.refreshToken();
        assertThatThrownBy(() -> service.refresh(initialToken)).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.refresh(rotatedToken)).isInstanceOf(ApiException.class);
    }

    @Test
    void rejectsInvalidCredentialsAndInactiveUser() {
        User user = new User("Reader", "reader@example.test", passwords.encode("long-passphrase-test"), clock.instant());
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        var incorrect = new LoginRequest(user.getEmail(), "wrong-password");
        var unknown = new LoginRequest("unknown@example.test", "wrong-password");
        var tooManyBytes = new LoginRequest(user.getEmail(), "é".repeat(40));
        var valid = new LoginRequest(user.getEmail(), "long-passphrase-test");
        assertThatThrownBy(() -> service.login(incorrect)).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.login(unknown)).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.login(tooManyBytes)).isInstanceOf(ApiException.class);
        user.changeStatus(false, clock.instant());
        assertThatThrownBy(() -> service.login(valid)).isInstanceOf(ApiException.class);
    }

    @Test
    void rejectsDuplicateEmailAndInvalidPasswords() {
        User user = new User("Reader", "reader@example.test", "unused", clock.instant());
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        var duplicate = new RegisterRequest("Reader", user.getEmail(), "long-passphrase-test");
        var tooShort = new RegisterRequest("Reader", "new@example.test", "short");
        var tooManyBytes = new RegisterRequest("Reader", "new@example.test", "é".repeat(40));
        assertThatThrownBy(() -> service.register(duplicate))
                .isInstanceOf(ApiException.class).hasMessage("Email já cadastrado.");
        assertThatThrownBy(() -> service.register(tooShort))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.register(tooManyBytes))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsMissingExpiredAndInactiveRefresh() {
        assertThatThrownBy(() -> service.refresh(null)).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.refresh(" ")).isInstanceOf(ApiException.class);
        String oversizedToken = "x".repeat(129);
        assertThatThrownBy(() -> service.refresh(oversizedToken)).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.refresh("unknown")).isInstanceOf(ApiException.class);
        User user = new User("Reader", "reader@example.test", "unused", clock.instant());
        RefreshToken expired = new RefreshToken("expired-hash", user, UUID.randomUUID(), clock.instant());
        when(refresh.lockByHash(any())).thenReturn(Optional.of(expired));
        assertThatThrownBy(() -> service.refresh("expired")).isInstanceOf(ApiException.class);
        user.changeStatus(false, clock.instant());
        RefreshToken inactive = new RefreshToken("inactive-hash", user, UUID.randomUUID(), clock.instant().plusSeconds(60));
        when(refresh.lockByHash(any())).thenReturn(Optional.of(inactive));
        assertThatThrownBy(() -> service.refresh("inactive")).isInstanceOf(ApiException.class);
    }

    @Test
    void logoutRevokesSessionAndIsIdempotent() {
        User user = new User("Reader", "reader@example.test", "unused", clock.instant());
        RefreshToken active = new RefreshToken("active-hash", user, UUID.randomUUID(), clock.instant().plusSeconds(60));
        when(refresh.lockByHash(any())).thenReturn(Optional.of(active));
        when(refresh.revokeFamily(any(), any())).thenAnswer(invocation -> { active.revoke(clock.instant()); return 1; });
        service.logout("active");
        assertThatThrownBy(() -> service.refresh("active")).isInstanceOf(ApiException.class);
        service.logout(null);
        service.logout("");
        service.logout("missing");
        service.logout("x".repeat(129));
    }

    private SecurityProperties properties() {
        byte[] secret = new byte[32];
        new SecureRandom().nextBytes(secret);
        return new SecurityProperties(Base64.getEncoder().encodeToString(secret), "https://library.test", "library-web",
                Duration.ofMinutes(15), Duration.ofDays(7), false, List.of("http://localhost:3000"));
    }
}
