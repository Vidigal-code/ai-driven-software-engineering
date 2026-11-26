package com.library.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

public final class AuthRequestFilter extends OncePerRequestFilter {
    private static final PathPatternRequestMatcher.Builder PATHS = PathPatternRequestMatcher.withDefaults();
    private static final RequestMatcher AUTH_REQUESTS = PATHS.matcher(HttpMethod.POST, "/api/v1/auth/**");
    private static final RequestMatcher CREDENTIAL_REQUESTS = new OrRequestMatcher(
            PATHS.matcher(HttpMethod.POST, "/api/v1/auth/register"), PATHS.matcher(HttpMethod.POST, "/api/v1/auth/login"));
    private final ObjectMapper mapper;
    private final List<String> allowedOrigins;
    private final AuthAttemptLimiter limiter;

    public AuthRequestFilter(AuthAttemptLimiter limiter, List<String> allowedOrigins, ObjectMapper mapper) {
        this.mapper = mapper;
        this.allowedOrigins = List.copyOf(allowedOrigins);
        this.limiter = limiter;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !AUTH_REQUESTS.matches(request);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String origin = request.getHeader("Origin");
        if (!"XMLHttpRequest".equals(request.getHeader("X-Requested-With"))
                || origin != null && !allowedOrigins.contains(origin)) {
            reject(response, HttpStatus.FORBIDDEN, "Requisição de autenticação não permitida.");
            return;
        }
        if (CREDENTIAL_REQUESTS.matches(request) && !limiter.tryAcquire(request.getRemoteAddr())) {
            response.setHeader("Retry-After", Long.toString(limiter.retryAfterSeconds()));
            reject(response, HttpStatus.TOO_MANY_REQUESTS, "Limite de tentativas atingido. Tente novamente mais tarde.");
            return;
        }
        chain.doFilter(request, response);
    }

    private void reject(HttpServletResponse response, HttpStatus status, String detail) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/problem+json");
        response.setHeader("Cache-Control", "no-store");
        mapper.writeValue(response.getOutputStream(), ProblemDetail.forStatusAndDetail(status, detail));
    }
}
