package com.library.api.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id private UUID id;
    private String tokenHash;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id") private User user;
    private UUID familyId;
    private Instant expiresAt;
    private Instant revokedAt;

    protected RefreshToken() { }

    public RefreshToken(String tokenHash, User user, UUID familyId, Instant expiresAt) {
        id = UUID.randomUUID();
        this.tokenHash = tokenHash;
        this.user = user;
        this.familyId = familyId;
        this.expiresAt = expiresAt;
    }

    public void revoke(Instant now) { revokedAt = now; }
    public UUID getId() { return id; }
    public String getTokenHash() { return tokenHash; }
    public User getUser() { return user; }
    public UUID getFamilyId() { return familyId; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getRevokedAt() { return revokedAt; }
}
