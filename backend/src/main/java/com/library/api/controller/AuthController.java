package com.library.api.controller;

import com.library.api.config.SecurityProperties;
import com.library.api.dto.*;
import com.library.api.exception.ApiException;
import com.library.api.mapper.UserMapper;
import com.library.api.repository.UserRepository;
import com.library.api.service.*;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
public class AuthController {
    public static final String REFRESH_COOKIE = "library_refresh";
    private final AuthService auth;
    private final UserRepository users;
    private final SecurityProperties properties;

    public AuthController(AuthService auth, UserRepository users, SecurityProperties properties) {
        this.auth = auth; this.users = users; this.properties = properties;
    }

    @PostMapping("/register")
    @Operation(summary = "Criar conta READER", parameters = @Parameter(name = "X-Requested-With", in = ParameterIn.HEADER, required = true, schema = @Schema(defaultValue = "XMLHttpRequest")))
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return sessionResponse(auth.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar", parameters = @Parameter(name = "X-Requested-With", in = ParameterIn.HEADER, required = true, schema = @Schema(defaultValue = "XMLHttpRequest")))
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return sessionResponse(auth.login(request), HttpStatus.OK);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotacionar sessão", parameters = @Parameter(name = "X-Requested-With", in = ParameterIn.HEADER, required = true, schema = @Schema(defaultValue = "XMLHttpRequest")))
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = REFRESH_COOKIE, required = false) String token) {
        return sessionResponse(auth.refresh(token), HttpStatus.OK);
    }

    @PostMapping("/logout")
    @Operation(summary = "Revogar sessão", parameters = @Parameter(name = "X-Requested-With", in = ParameterIn.HEADER, required = true, schema = @Schema(defaultValue = "XMLHttpRequest")))
    public ResponseEntity<Void> logout(@CookieValue(name = REFRESH_COOKIE, required = false) String token) {
        auth.logout(token);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO)).build();
    }

    @GetMapping("/me")
    @Operation(summary = "Consultar usuário autenticado")
    public UserResponse me(Authentication authentication) {
        return UserMapper.toResponse(users.findById(UUID.fromString(authentication.getName()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Sessão inválida.")));
    }

    private ResponseEntity<AuthResponse> sessionResponse(AuthSession session, HttpStatus status) {
        return ResponseEntity.status(status).header(HttpHeaders.SET_COOKIE, cookie(session.refreshToken(), properties.refreshTokenTtl()))
                .header(HttpHeaders.CACHE_CONTROL, "no-store").body(session.response());
    }

    private String cookie(String value, Duration age) {
        return ResponseCookie.from(REFRESH_COOKIE, value).httpOnly(true).secure(properties.cookieSecure())
                .sameSite("Strict").path("/api/v1/auth").maxAge(age).build().toString();
    }
}
