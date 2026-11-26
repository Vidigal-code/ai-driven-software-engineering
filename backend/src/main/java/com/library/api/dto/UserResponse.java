package com.library.api.dto;

import com.library.api.entity.Role;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(UUID id, String name, String email, Role role, boolean active,
        Instant createdAt, Instant updatedAt) { }
