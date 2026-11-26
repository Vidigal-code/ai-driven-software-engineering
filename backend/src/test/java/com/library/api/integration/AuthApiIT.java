package com.library.api.integration;

import com.library.api.entity.Role;
import com.library.api.entity.User;
import com.library.api.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Timeout(60)
class AuthApiIT {
    @Container
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17.12-alpine");
    private static final String SECRET = randomSecret();
    private static final String PASSPHRASE = "integration-only-passphrase";
    private static final String AUTH_HEADER = "X-Requested-With";
    private static final String AUTH_VALUE = "XMLHttpRequest";
    private static final String COOKIE_NAME = "library_refresh";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder passwords;

    private record Session(String token, Cookie refresh, String id) { }

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("library.security.jwt-secret", () -> SECRET);
        registry.add("library.auth.max-attempts", () -> 1000);
    }

    @Test
    void registersOnlyReaderAndKeepsRefreshOutOfTheJsonBody() throws Exception {
        var response = registerResponse(Map.of("name", "Reader", "email", email(), "password", PASSPHRASE));
        var json = mapper.readTree(response.getResponse().getContentAsString());
        assertThat(json.get("user").get("role").asString()).isEqualTo("READER");
        assertThat(json.has("refreshToken")).isFalse();
        assertThat(json.get("user").has("passwordHash")).isFalse();
        String cookie = response.getResponse().getHeader("Set-Cookie");
        assertThat(cookie).contains("HttpOnly", "SameSite=Strict", "Path=/api/v1/auth");
        assertThat(response.getResponse().getHeader("Cache-Control")).contains("no-store");
        var session = session(response);
        mvc.perform(authorized(get("/api/v1/auth/me"), session))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(session.id()));
    }

    @Test
    void rejectsPrivilegeInjectionAndInvalidRegistration() throws Exception {
        mvc.perform(authPost("/register").content(mapper.writeValueAsString(Map.of(
                "name", "Reader", "email", email(), "password", PASSPHRASE, "role", "ADMIN"))))
                .andExpect(status().isBadRequest());
        mvc.perform(authPost("/register").content(mapper.writeValueAsString(Map.of(
                "name", "", "email", "invalid", "password", "short"))))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void rejectsDuplicateEmailIgnoringCase() throws Exception {
        String email = email();
        registerResponse(Map.of("name", "Reader", "email", email, "password", PASSPHRASE));
        mvc.perform(authPost("/register").content(mapper.writeValueAsString(Map.of(
                "name", "Reader", "email", email.toUpperCase(java.util.Locale.ROOT), "password", PASSPHRASE))))
                .andExpect(status().isConflict());
    }

    @Test
    void deniesAnonymousInvalidCredentialsAndReaderWrites() throws Exception {
        mvc.perform(get("/api/v1/books")).andExpect(status().isUnauthorized());
        mvc.perform(authPost("/login").content(mapper.writeValueAsString(Map.of("email", email(), "password", PASSPHRASE))))
                .andExpect(status().isUnauthorized());
        Session reader = register();
        mvc.perform(authorized(post("/api/v1/books"), reader).contentType("application/json").content("{}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.status").value(403));
        String book = "/api/v1/books/" + UUID.randomUUID();
        mvc.perform(authorized(put(book), reader).contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(authorized(delete(book), reader)).andExpect(status().isForbidden());
        mvc.perform(authorized(get("/api/v1/users"), reader)).andExpect(status().isForbidden());
    }

    @Test
    void rejectsCrossSiteCookieMutationsAndMissingCustomHeader() throws Exception {
        mvc.perform(post("/api/v1/auth/refresh")).andExpect(status().isForbidden());
        mvc.perform(authPost("/refresh").header("Origin", "https://untrusted.example.test"))
                .andExpect(status().isForbidden());
        mvc.perform(authPost("/refresh")).andExpect(status().isUnauthorized());
    }

    @Test
    void rotatesRefreshAndCommitsFamilyRevocationWhenReplayIsRejected() throws Exception {
        Session original = register();
        MvcResult rotation = mvc.perform(authPost("/refresh").cookie(original.refresh()))
                .andExpect(status().isOk()).andReturn();
        Session successor = session(rotation);
        assertThat(successor.refresh().getValue()).isNotEqualTo(original.refresh().getValue());
        mvc.perform(authPost("/refresh").cookie(original.refresh())).andExpect(status().isUnauthorized());
        mvc.perform(authPost("/refresh").cookie(successor.refresh())).andExpect(status().isUnauthorized());
    }

    @Test
    void serializesConcurrentRefreshSoReplayCannotLeaveAUsableSuccessor() throws Exception {
        Session original = register();
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> mvc.perform(authPost("/refresh").cookie(original.refresh())).andReturn());
            var second = executor.submit(() -> mvc.perform(authPost("/refresh").cookie(original.refresh())).andReturn());
            var responses = List.of(first.get(), second.get());
            assertThat(responses.stream().map(result -> result.getResponse().getStatus()).toList())
                    .containsExactlyInAnyOrder(200, 401);
            var success = responses.stream().filter(result -> result.getResponse().getStatus() == 200).findFirst().orElseThrow();
            mvc.perform(authPost("/refresh").cookie(session(success).refresh())).andExpect(status().isUnauthorized());
        }
    }

    @Test
    void logoutClearsCookieAndRevokesTheRefreshFamily() throws Exception {
        Session session = register();
        var response = mvc.perform(authPost("/logout").cookie(session.refresh()))
                .andExpect(status().isNoContent()).andReturn().getResponse();
        assertThat(response.getHeader("Set-Cookie")).contains("Max-Age=0", "HttpOnly");
        mvc.perform(authPost("/refresh").cookie(session.refresh())).andExpect(status().isUnauthorized());
        mvc.perform(authPost("/logout")).andExpect(status().isNoContent());
    }

    @ParameterizedTest
    @ValueSource(strings = { "signature", "issuer", "audience", "expiration" })
    void rejectsInvalidJwtClaimsOrSignature(String defect) throws Exception {
        Session reader = register();
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + invalidToken(reader.id(), defect)))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void enforcesCurrentRoleAndActiveStatusAgainstAlreadyIssuedTokens() throws Exception {
        Session admin = administrator();
        Session reader = register();
        mvc.perform(authorized(patch("/api/v1/users/" + reader.id() + "/role"), admin)
                .contentType("application/json").content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isOk());
        mvc.perform(authorized(get("/api/v1/users"), reader)).andExpect(status().isOk());
        mvc.perform(authorized(patch("/api/v1/users/" + reader.id() + "/role"), admin)
                .contentType("application/json").content("{\"role\":\"READER\"}"))
                .andExpect(status().isOk());
        mvc.perform(authorized(get("/api/v1/users"), reader)).andExpect(status().isForbidden());
        mvc.perform(authorized(patch("/api/v1/users/" + reader.id() + "/status"), admin)
                .contentType("application/json").content("{\"active\":false}"))
                .andExpect(status().isOk());
        mvc.perform(authorized(get("/api/v1/auth/me"), reader)).andExpect(status().isUnauthorized());
        mvc.perform(authPost("/refresh").cookie(reader.refresh())).andExpect(status().isUnauthorized());
    }

    private Session register() throws Exception {
        return session(registerResponse(Map.of("name", "Reader", "email", email(), "password", PASSPHRASE)));
    }

    private MvcResult registerResponse(Map<String, String> body) throws Exception {
        return mvc.perform(authPost("/register").content(mapper.writeValueAsString(body)))
                .andExpect(status().isCreated()).andReturn();
    }

    private Session administrator() throws Exception {
        String email = email();
        User admin = new User("Administrator", email, passwords.encode(PASSPHRASE), Instant.now());
        admin.changeRole(Role.ADMIN, Instant.now());
        users.saveAndFlush(admin);
        return session(mvc.perform(authPost("/login").content(mapper.writeValueAsString(Map.of("email", email, "password", PASSPHRASE))))
                .andExpect(status().isOk()).andReturn());
    }

    private Session session(MvcResult result) throws java.io.UnsupportedEncodingException {
        var body = mapper.readTree(result.getResponse().getContentAsString());
        var cookie = result.getResponse().getCookie(COOKIE_NAME);
        assertThat(cookie).isNotNull();
        return new Session(body.get("accessToken").asString(), cookie, body.get("user").get("id").asString());
    }

    private MockHttpServletRequestBuilder authPost(String suffix) {
        return post("/api/v1/auth" + suffix).header(AUTH_HEADER, AUTH_VALUE).contentType("application/json");
    }

    private MockHttpServletRequestBuilder authorized(MockHttpServletRequestBuilder request, Session session) {
        return request.header("Authorization", "Bearer " + session.token());
    }

    private String invalidToken(String subject, String defect) {
        byte[] bytes = Base64.getDecoder().decode(defect.equals("signature") ? randomSecret() : SECRET);
        var encoder = NimbusJwtEncoder.withSecretKey(new SecretKeySpec(bytes, "HmacSHA256")).algorithm(MacAlgorithm.HS256).build();
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder().subject(subject).issuedAt(now.minusSeconds(120))
                .expiresAt(defect.equals("expiration") ? now.minusSeconds(60) : now.plusSeconds(600))
                .issuer(defect.equals("issuer") ? "wrong-issuer" : "library-api")
                .audience(List.of(defect.equals("audience") ? "wrong-audience" : "library-web")).build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }

    private static String email() { return UUID.randomUUID() + "@example.test"; }

    private static String randomSecret() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }
}
