package com.library.api.service;

import com.library.api.dto.AuthResponse;

public record AuthSession(AuthResponse response, String refreshToken) { }
