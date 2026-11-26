package com.library.api.dto;
import jakarta.validation.constraints.NotNull;
public record StatusRequest(@NotNull Boolean active) { }
