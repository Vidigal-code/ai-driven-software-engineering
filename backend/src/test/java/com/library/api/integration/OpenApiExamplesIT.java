package com.library.api.integration;

import com.library.api.dto.AuthResponse;
import com.library.api.entity.Role;
import com.library.api.entity.User;
import com.library.api.repository.BookRepository;
import com.library.api.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.core.type.TypeReference;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class OpenApiExamplesIT {
    @Container static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17.12-alpine");
    private static final String SECRET = secret();
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserRepository users;
    @Autowired BookRepository books;
    @Autowired PasswordEncoder passwords;

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("library.security.jwt-secret", () -> SECRET);
        registry.add("library.auth.max-attempts", () -> 1000);
        registry.add("library.pagination.max-size", () -> 37);
    }

    @BeforeEach
    void cleanCatalog() { books.deleteAll(); }

    @Test
    void publishedBookExampleCreatesARealBook() throws Exception {
        JsonNode document = document();
        JsonNode example = requestExample(document, "/api/v1/books", "post", "validBook");
        assertThat(example.isObject()).as("published, editable JSON example").isTrue();
        String token = administrativeSession();
        mvc.perform(authorized(post("/api/v1/books"), token).content(example.toString()))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.isbn").value("9780201485677"))
                .andExpect(jsonPath("$.availableCopies").value(2));
    }

    @Test
    void publishedAuthenticationExamplesCreateAndAuthenticateOnlyAReader() throws Exception {
        JsonNode document = document();
        JsonNode register = requestExample(document, "/api/v1/auth/register", "post", "registerReader");
        JsonNode login = requestExample(document, "/api/v1/auth/login", "post", "loginWithOwnCredentials");
        assertThat(register.isObject()).as("registration example").isTrue();
        assertThat(login.isObject()).as("login example").isTrue();
        String email = UUID.randomUUID() + "@example.test";
        String password = UUID.randomUUID().toString();
        Map<String, Object> registration = credentials(register, email, password);
        String body = mvc.perform(authPost("/register").content(mapper.writeValueAsString(registration)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.user.role").value("READER"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist()).andReturn().getResponse().getContentAsString();
        AuthResponse created = mapper.readValue(body, AuthResponse.class);
        mvc.perform(authorized(get("/api/v1/auth/me"), created.accessToken())).andExpect(status().isOk());
        var authenticated = mvc.perform(authPost("/login").content(mapper.writeValueAsString(credentials(login, email, password))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").isNotEmpty()).andReturn();
        Cookie cookie = authenticated.getResponse().getCookie("library_refresh");
        assertThat(cookie).isNotNull();
        var renewed = mvc.perform(authPost("/refresh").cookie(cookie)).andExpect(status().isOk()).andReturn();
        Cookie rotated = renewed.getResponse().getCookie("library_refresh");
        assertThat(rotated).isNotNull();
        mvc.perform(authPost("/logout").cookie(rotated)).andExpect(status().isNoContent());
        mvc.perform(authPost("/refresh").cookie(rotated)).andExpect(status().isUnauthorized());
        mvc.perform(authPost("/register").content(mapper.writeValueAsString(registration)))
                .andExpect(status().isConflict());
        mvc.perform(authorized(post("/api/v1/books"), created.accessToken())
                        .content(requestExample(document, "/api/v1/books", "post", "validBook").toString()))
                .andExpect(status().isForbidden());
    }

    private Map<String, Object> credentials(JsonNode example, String email, String password) {
        Map<String, Object> values = new HashMap<>(mapper.convertValue(example, new TypeReference<Map<String, Object>>() { }));
        values.put("email", email);
        values.put("password", password);
        return values;
    }

    @Test
    void everyPublishedOperationDescribesExecutablePayloadsAndApplicableResponses() throws Exception {
        JsonNode document = document();
        for (JsonNode path : document.path("paths")) {
            for (JsonNode operation : path) {
                assertThat(operation.path("description").asString()).as("operation instructions").isNotBlank();
                JsonNode request = operation.path("requestBody");
                if (!request.isMissingNode()) {
                    assertThat(request.path("content").path("application/json").path("examples").size()).isPositive();
                }
                for (String status : List.of("200", "201", "400", "401", "403", "404", "409", "429")) {
                    JsonNode response = operation.path("responses").path(status);
                    if (!response.isMissingNode()) {
                        String media = status.startsWith("2") ? "application/json" : "application/problem+json";
                        assertThat(response.path("content").path(media).path("examples").size())
                                .as("documented example for HTTP %s", status).isPositive();
                    }
                }
                JsonNode noContent = operation.path("responses").path("204");
                if (!noContent.isMissingNode()) assertThat(noContent.has("content")).isFalse();
                for (JsonNode parameter : operation.path("parameters")) {
                    assertThat(parameter.path("description").asString()).as("parameter description").isNotBlank();
                    assertThat(parameter.path("in").asString()).isNotEqualTo("cookie");
                }
            }
        }
        assertThat(document.path("paths").path("/api/v1/books").path("get").path("responses").has("429")).isFalse();
        assertThat(document.path("paths").path("/api/v1/auth/login").path("post").path("responses").has("404")).isFalse();
        for (JsonNode schema : document.path("components").path("schemas")) {
            for (JsonNode field : schema.path("properties")) {
                assertThat(field.path("description").asString()).as("schema field description").isNotBlank();
            }
        }
    }

    @Test
    void publishedBookVariantsSupportCrudFiltersAndDocumentedFailures() throws Exception {
        JsonNode document = document();
        String token = administrativeSession();
        JsonNode create = requestExample(document, "/api/v1/books", "post", "validBook");
        String response = mvc.perform(authorized(post("/api/v1/books"), token).content(create.toString()))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String id = mapper.readTree(response).path("id").asString();
        mvc.perform(authorized(post("/api/v1/books"), token).content(create.toString())).andExpect(status().isConflict());
        mvc.perform(authorized(post("/api/v1/books"), token)
                        .content(requestExample(document, "/api/v1/books", "post", "isbn10Book").toString()))
                .andExpect(status().isConflict());
        for (String name : List.of("invalidCopies", "invalidIsbn")) {
            mvc.perform(authorized(post("/api/v1/books"), token)
                            .content(requestExample(document, "/api/v1/books", "post", name).toString()))
                    .andExpect(status().isBadRequest()).andExpect(content().contentTypeCompatibleWith("application/problem+json"));
        }
        mvc.perform(authorized(put("/api/v1/books/" + id), token)
                        .content(requestExample(document, "/api/v1/books/{id}", "put", "updateBook").toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.availableCopies").value(3));
        mvc.perform(authorized(get("/api/v1/books"), token).param("isbn", "0-201-48567-2")
                        .param("title", "Refactoring").param("author", "Fowler").param("available", "true")
                        .param("category", "Engenharia de software").param("page", "0").param("size", "1").param("sort", "title,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].id").value(id));
        mvc.perform(authorized(get("/api/v1/books"), token).param("size", "38")).andExpect(status().isBadRequest());
        mvc.perform(authorized(get("/api/v1/dashboard/summary"), token)).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTitles").value(1)).andExpect(jsonPath("$.availableCopies").value(3));
        mvc.perform(authorized(delete("/api/v1/books/" + id), token)).andExpect(status().isNoContent());
        mvc.perform(authorized(get("/api/v1/books/" + id), token)).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/books")).andExpect(status().isUnauthorized());
    }

    @Test
    void publishedAdministrationExamplesChangeOnlyTheRequestedUser() throws Exception {
        JsonNode document = document();
        Map<String, Object> registration = credentials(requestExample(document, "/api/v1/auth/register", "post", "registerReader"),
                UUID.randomUUID() + "@example.test", UUID.randomUUID().toString());
        String response = mvc.perform(authPost("/register").content(mapper.writeValueAsString(registration)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        AuthResponse reader = mapper.readValue(response, AuthResponse.class);
        String id = reader.user().id().toString();
        String token = administrativeSession();
        mvc.perform(authorized(get("/api/v1/users"), token)).andExpect(status().isOk());
        mvc.perform(authorized(get("/api/v1/users/" + id), token)).andExpect(status().isOk()).andExpect(jsonPath("$.id").value(id));
        for (String name : List.of("promoteToLibrarian", "adminRole", "readerRole")) {
            JsonNode payload = requestExample(document, "/api/v1/users/{id}/role", "patch", name);
            mvc.perform(authorized(patch("/api/v1/users/" + id + "/role"), token).content(payload.toString()))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.role").value(payload.path("role").asString()));
        }
        mvc.perform(authorized(patch("/api/v1/users/" + id + "/status"), token)
                        .content(requestExample(document, "/api/v1/users/{id}/status", "patch", "deactivateUser").toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
        mvc.perform(authorized(get("/api/v1/auth/me"), reader.accessToken())).andExpect(status().isUnauthorized());
        mvc.perform(authorized(patch("/api/v1/users/" + id + "/status"), token)
                        .content(requestExample(document, "/api/v1/users/{id}/status", "patch", "activateUser").toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void swaggerUsesSameOriginAndEditableExamplesWithoutPersistingCredentials() throws Exception {
        JsonNode document = document();
        assertThat(document.path("servers").path(0).path("url").asString()).isEqualTo("/");
        assertThat(document.path("info").path("description").asString()).contains("Authorize", "READER", "LIBRARIAN", "HttpOnly", "refresh", "logout");
        mvc.perform(get("/v3/api-docs/swagger-config")).andExpect(status().isOk())
                .andExpect(jsonPath("$.persistAuthorization").value(false)).andExpect(jsonPath("$.tryItOutEnabled").value(true))
                .andExpect(jsonPath("$.displayOperationId").value(true));
        for (String operation : List.of("register", "login", "refresh", "logout")) {
            JsonNode parameters = document.path("paths").path("/api/v1/auth/" + operation).path("post").path("parameters");
            assertThat(parameters.size()).isEqualTo(1);
            assertThat(parameters.path(0).path("name").asString()).isEqualTo("X-Requested-With");
            assertThat(parameters.path(0).path("schema").path("default").asString()).isEqualTo("XMLHttpRequest");
        }
        for (String origin : List.of("http://localhost:3000", "http://localhost:8080")) {
            mvc.perform(authPost("/logout").header("Origin", origin)).andExpect(status().isNoContent());
        }
        assertThat(document.path("components").path("schemas").path("RegisterRequest")
                .path("properties").path("password").path("writeOnly").asBoolean()).isTrue();
        for (JsonNode parameter : document.path("paths").path("/api/v1/books").path("get").path("parameters")) {
            if ("size".equals(parameter.path("name").asString())) assertThat(parameter.path("schema").path("maximum").asInt()).isEqualTo(37);
        }
    }

    private MockHttpServletRequestBuilder authPost(String suffix) {
        return post("/api/v1/auth" + suffix).header("X-Requested-With", "XMLHttpRequest").contentType("application/json");
    }

    private JsonNode document() throws Exception {
        String json = mvc.perform(get("/v3/api-docs")).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(json);
    }

    private JsonNode requestExample(JsonNode document, String path, String method, String example) {
        return document.path("paths").path(path).path(method).path("requestBody").path("content")
                .path("application/json").path("examples").path(example).path("value");
    }

    private MockHttpServletRequestBuilder authorized(MockHttpServletRequestBuilder request, String token) {
        return request.header("Authorization", "Bearer " + token).contentType("application/json");
    }

    private String administrativeSession() throws Exception {
        String email = UUID.randomUUID() + "@example.test";
        String password = UUID.randomUUID().toString();
        User admin = new User("Contract administrator", email, passwords.encode(password), Instant.now());
        admin.changeRole(Role.ADMIN, Instant.now());
        users.saveAndFlush(admin);
        String json = mvc.perform(post("/api/v1/auth/login").header("X-Requested-With", "XMLHttpRequest")
                        .contentType("application/json").content(mapper.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return mapper.readValue(json, AuthResponse.class).accessToken();
    }

    private static String secret() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }
}
