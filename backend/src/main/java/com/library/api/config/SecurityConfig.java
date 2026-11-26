package com.library.api.config;

import com.library.api.repository.UserRepository;
import com.library.api.entity.User;
import com.library.api.security.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import tools.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.*;
import java.util.*;

@Configuration(proxyBeanMethods = false)
public class SecurityConfig {
    @Bean Clock clock() { return Clock.systemUTC(); }
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }

    @Bean
    AuthAttemptLimiter attemptLimiter(Clock clock, @Value("${library.auth.max-attempts}") int attempts,
            @Value("${library.auth.window}") Duration window, @Value("${library.auth.capacity}") int capacity) {
        return new AuthAttemptLimiter(clock, new AuthAttemptLimiter.Policy(attempts, window, capacity));
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityProperties properties, TokenService tokens,
            UserRepository users, AuthAttemptLimiter limiter, ObjectMapper mapper,
            @Value("${springdoc.api-docs.enabled}") boolean openApiEnabled) {
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsSource(properties)))
                .headers(headers -> headers.contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'")))
                .authorizeHttpRequests(authorize -> {
                    authorize.requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                            .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/refresh", "/api/v1/auth/logout").permitAll();
                    if (openApiEnabled) { authorize.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll(); }
                    authorize.requestMatchers("/api/v1/users/**").hasRole("ADMIN")
                            .requestMatchers(HttpMethod.GET, "/api/v1/books/**", "/api/v1/dashboard/**", "/api/v1/auth/me").authenticated()
                            .requestMatchers("/api/v1/books/**").hasAnyRole("ADMIN", "LIBRARIAN").anyRequest().denyAll();
                })
                .oauth2ResourceServer(resource -> resource.jwt(jwt -> jwt.decoder(tokens).jwtAuthenticationConverter(token -> {
                    UUID id;
                    try { id = UUID.fromString(token.getSubject()); }
                    catch (IllegalArgumentException exception) { throw new BadCredentialsException("Sessão inválida.", exception); }
                    var user = users.findById(id).filter(User::isActive)
                            .orElseThrow(() -> new BadCredentialsException("Sessão inválida."));
                    return new JwtAuthenticationToken(token, List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())), id.toString());
                })).authenticationEntryPoint((request, response, exception) -> writeProblem(response, mapper, HttpStatus.UNAUTHORIZED)))
                .exceptionHandling(errors -> errors.authenticationEntryPoint((request, response, exception) -> writeProblem(response, mapper, HttpStatus.UNAUTHORIZED))
                        .accessDeniedHandler((request, response, exception) -> writeProblem(response, mapper, HttpStatus.FORBIDDEN)))
                .addFilterBefore(new AuthRequestFilter(limiter, properties.allowedOrigins(), mapper), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private CorsConfigurationSource corsSource(SecurityProperties properties) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(properties.allowedOrigins());
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cors);
        return source;
    }

    private void writeProblem(HttpServletResponse response, ObjectMapper mapper, HttpStatus status) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        mapper.writeValue(response.getOutputStream(), ProblemDetail.forStatusAndDetail(status,
                status == HttpStatus.UNAUTHORIZED ? "Autenticação necessária ou inválida." : "Permissão insuficiente."));
    }
}
