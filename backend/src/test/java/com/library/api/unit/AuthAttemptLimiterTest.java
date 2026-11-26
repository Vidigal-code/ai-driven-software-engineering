package com.library.api.unit;

import com.library.api.security.AuthAttemptLimiter;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthAttemptLimiterTest {
    private static final Instant NOW = Instant.parse("2026-01-01T00:00:00Z");

    @Test
    void blocksAttemptsAboveThePerAddressLimit() {
        var policy = new AuthAttemptLimiter.Policy(2, Duration.ofMinutes(1), 10);
        var limiter = new AuthAttemptLimiter(Clock.fixed(NOW, ZoneOffset.UTC), policy);
        assertThat(limiter.tryAcquire("192.0.2.1")).isTrue();
        assertThat(limiter.tryAcquire("192.0.2.1")).isTrue();
        assertThat(limiter.tryAcquire("192.0.2.1")).isFalse();
        assertThat(limiter.tryAcquire("192.0.2.2")).isTrue();
    }

    @Test
    void restoresAllowanceWhenTheWindowExpires() {
        Clock clock = mock(Clock.class);
        when(clock.instant()).thenReturn(NOW);
        var limiter = new AuthAttemptLimiter(clock, new AuthAttemptLimiter.Policy(1, Duration.ofSeconds(60), 10));
        assertThat(limiter.tryAcquire("192.0.2.1")).isTrue();
        when(clock.instant()).thenReturn(NOW.plusSeconds(59));
        assertThat(limiter.tryAcquire("192.0.2.1")).isFalse();
        when(clock.instant()).thenReturn(NOW.plusSeconds(60));
        assertThat(limiter.tryAcquire("192.0.2.1")).isTrue();
    }

    @Test
    void boundsMemoryWithoutEvictingActiveLimitsAndReclaimsExpiredEntries() {
        Clock clock = mock(Clock.class);
        when(clock.instant()).thenReturn(NOW);
        var limiter = new AuthAttemptLimiter(clock, new AuthAttemptLimiter.Policy(1, Duration.ofSeconds(60), 1));
        assertThat(limiter.tryAcquire("192.0.2.1")).isTrue();
        assertThat(limiter.tryAcquire("192.0.2.2")).isFalse();
        assertThat(limiter.tryAcquire("192.0.2.1")).isFalse();
        when(clock.instant()).thenReturn(NOW.plusSeconds(60));
        assertThat(limiter.tryAcquire("192.0.2.2")).isTrue();
    }

    @Test
    void rejectsUnboundedOrInvalidPolicies() {
        assertThatIllegalArgumentException().isThrownBy(() -> new AuthAttemptLimiter.Policy(0, Duration.ofSeconds(60), 10));
        assertThatIllegalArgumentException().isThrownBy(() -> new AuthAttemptLimiter.Policy(1, Duration.ZERO, 10));
        assertThatIllegalArgumentException().isThrownBy(() -> new AuthAttemptLimiter.Policy(1, Duration.ofSeconds(60), 0));
    }
}
