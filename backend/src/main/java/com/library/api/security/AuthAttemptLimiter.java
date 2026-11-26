package com.library.api.security;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

public final class AuthAttemptLimiter {
    public record Policy(int maxAttempts, Duration window, int capacity) {
        public Policy {
            if (maxAttempts < 1 || capacity < 1 || window == null || window.compareTo(Duration.ofSeconds(1)) < 0) {
                throw new IllegalArgumentException("Authentication limits must be positive and the window at least one second.");
            }
        }
    }
    private record Window(int attempts, Instant expiresAt) { }

    private final Policy policy;
    private final Clock clock;
    private final Map<String, Window> attempts = new HashMap<>();

    public AuthAttemptLimiter(Clock clock, Policy policy) {
        this.policy = policy;
        this.clock = clock;
    }

    public synchronized boolean tryAcquire(String remoteAddress) {
        Instant now = clock.instant();
        if (!attempts.containsKey(remoteAddress) && attempts.size() >= policy.capacity()) {
            attempts.values().removeIf(window -> !window.expiresAt().isAfter(now));
            if (attempts.size() >= policy.capacity()) return false;
        }
        Window window = attempts.get(remoteAddress);
        if (window == null || !window.expiresAt().isAfter(now)) {
            window = new Window(0, now.plus(policy.window()));
        }
        if (window.attempts() >= policy.maxAttempts()) return false;
        attempts.put(remoteAddress, new Window(window.attempts() + 1, window.expiresAt()));
        return true;
    }

    public long retryAfterSeconds() {
        return policy.window().toSeconds() + (policy.window().getNano() > 0 ? 1 : 0);
    }
}
