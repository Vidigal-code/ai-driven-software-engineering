package com.library.api.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "library_users")
public class User {
    @Id private UUID id;
    private String name;
    private String email;
    private String passwordHash;
    @Enumerated(EnumType.STRING) private Role role;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    protected User() { }

    public User(String name, String email, String passwordHash, Instant now) {
        id = UUID.randomUUID();
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        role = Role.READER;
        active = true;
        createdAt = now;
        updatedAt = now;
    }

    public void changeRole(Role role, Instant now) { this.role = role; updatedAt = now; }
    public void changeStatus(boolean active, Instant now) { this.active = active; updatedAt = now; }
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
