package com.library.api.dto;
import com.library.api.entity.Role;
import jakarta.validation.constraints.NotNull;
public record RoleRequest(@NotNull Role role) { }
