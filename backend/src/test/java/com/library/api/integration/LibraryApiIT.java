package com.library.api.integration;

import com.library.api.dto.*;
import com.library.api.entity.*;
import com.library.api.repository.UserRepository;
import com.library.api.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.ObjectMapper;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class LibraryApiIT {
    @Container static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17.12-alpine");
    private static final String SECRET = secret();
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder passwords;
    @Autowired BookRepository books;

    @BeforeEach
    void cleanCatalog() { books.deleteAll(); }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("library.security.jwt-secret", () -> SECRET);
        registry.add("library.auth.max-attempts", () -> 1000);
    }

    @Test
    void filtersAndPaginates() throws Exception {
        String token = login(Role.LIBRARIAN);
        BookRequest book = new BookRequest("Clean Code", "Robert Martin", "9780132350884", "Pearson", 2008, "Engineering", "Description", 5, 3);
        mvc.perform(post("/api/v1/books").header("Authorization", "Bearer " + token).contentType("application/json").content(mapper.writeValueAsString(book)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").isNotEmpty());
        mvc.perform(get("/api/v1/books").header("Authorization", "Bearer " + token).param("title", "Clean").param("available", "true").param("size", "1").param("sort", "title,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].title").value("Clean Code"))
                .andExpect(jsonPath("$.totalElements").value(1)).andExpect(jsonPath("$.number").value(0));
        mvc.perform(get("/api/v1/books").header("Authorization", "Bearer " + token).param("author", "Martin").param("isbn", "978-0-13").param("category", "engineering"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/v1/books").header("Authorization", "Bearer " + token).param("available", "false"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content").isEmpty());
        mvc.perform(get("/api/v1/books").header("Authorization", "Bearer " + token).param("title", "%"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content").isEmpty());
    }

    @Test
    void findsCanonicalBookByEquivalentIsbn10() throws Exception {
        String token = login(Role.LIBRARIAN);
        BookResponse created = create(token, new BookRequest("Clean Code", "Martin", "0-13-235088-2", "", 2008, "Engineering", "", 1, 1));
        for (String isbn : List.of("0-13-235088-2", "978-0-13-235088-4", "978-0-13")) {
            mvc.perform(get("/api/v1/books").header("Authorization", "Bearer " + token).param("isbn", isbn))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.totalElements").value(1))
                    .andExpect(jsonPath("$.content[0].id").value(created.id().toString()));
        }
        mvc.perform(get("/api/v1/books").header("Authorization", "Bearer " + token).param("isbn", "0132350888"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content").isEmpty());
    }

    @Test
    void crudValidationAndMissingResource() throws Exception {
        String token = login(Role.LIBRARIAN);
        var request = new BookRequest("Original", "Author", "9780201616224", "Publisher", 1999, "Software", "Text", 2, 1);
        var created = create(token, request);
        mvc.perform(get("/api/v1/books/" + created.id()).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.title").value("Original"));
        var update = new BookRequest("Updated", "Author", "9780201616224", "Publisher", 1999, "Software", "Text", 2, 0);
        mvc.perform(put("/api/v1/books/" + created.id()).header("Authorization", "Bearer " + token).contentType("application/json").content(mapper.writeValueAsString(update)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.title").value("Updated"));
        var invalid = new BookRequest(" ", "", "invalid", null, 9999, null, null, 0, 1);
        mvc.perform(put("/api/v1/books/" + created.id()).header("Authorization", "Bearer " + token).contentType("application/json").content(mapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest()).andExpect(content().contentTypeCompatibleWith("application/problem+json"));
        mvc.perform(delete("/api/v1/books/" + created.id()).header("Authorization", "Bearer " + token)).andExpect(status().isNoContent());
        mvc.perform(get("/api/v1/books/" + created.id()).header("Authorization", "Bearer " + token)).andExpect(status().isNotFound());
        mvc.perform(delete("/api/v1/books/" + created.id()).header("Authorization", "Bearer " + token)).andExpect(status().isNotFound());
    }

    @Test
    void concurrentDuplicateIsbn() throws Exception {
        String token = login(Role.LIBRARIAN);
        String body = mapper.writeValueAsString(new BookRequest("Concurrent", "Author", "9780321125217", "Publisher", 2003, "Design", "", 1, 1));
        CountDownLatch start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Integer> insert = () -> {
                start.await();
                return mvc.perform(post("/api/v1/books").header("Authorization", "Bearer " + token).contentType("application/json").content(body))
                        .andReturn().getResponse().getStatus();
            };
            Future<Integer> first = executor.submit(insert);
            Future<Integer> second = executor.submit(insert);
            start.countDown();
            assertThat(List.of(first.get(30, TimeUnit.SECONDS), second.get(30, TimeUnit.SECONDS))).containsExactlyInAnyOrder(201, 409);
        }
        mvc.perform(get("/api/v1/books").header("Authorization", "Bearer " + token)).andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void dashboardUsesRealBooks() throws Exception {
        String token = login(Role.LIBRARIAN);
        mvc.perform(get("/api/v1/dashboard/summary").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalTitles").value(0)).andExpect(jsonPath("$.recentBooks").isEmpty());
        create(token, new BookRequest("Clean Code", "Martin", "9780132350884", "Pearson", 2008, "Engineering", "", 5, 3));
        create(token, new BookRequest("Refactoring", "Fowler", "9780201485677", "Pearson", 1999, "Design", "", 2, 0));
        mvc.perform(get("/api/v1/dashboard/summary").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalTitles").value(2)).andExpect(jsonPath("$.totalCopies").value(7))
                .andExpect(jsonPath("$.availableCopies").value(3)).andExpect(jsonPath("$.unavailableCopies").value(4))
                .andExpect(jsonPath("$.totalCategories").value(2)).andExpect(jsonPath("$.recentBooks.length()").value(2));
    }

    @Test
    void rejectsInvalidPaging() throws Exception {
        String token = login(Role.READER);
        for (String query : List.of("page=-1", "size=101", "size=0", "sort=passwordHash,desc", "sort=title,invalid", "sort=title")) {
            mvc.perform(get("/api/v1/books?" + query).header("Authorization", "Bearer " + token))
                    .andExpect(status().isBadRequest()).andExpect(content().contentTypeCompatibleWith("application/problem+json"));
        }
    }

    @Test
    void sortsPagesAndTreatsSqlPayloadAsLiteralText() throws Exception {
        String token = login(Role.LIBRARIAN);
        create(token, new BookRequest("Beta", "Second", "9780132350884", "", 2008, "Engineering", "", 3, 0));
        create(token, new BookRequest("Alpha", "First", "9780201616224", "", 1999, "Design", "", 2, 2));
        mvc.perform(get("/api/v1/books").header("Authorization", "Bearer " + token).param("sort", "title,asc").param("page", "1").param("size", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].title").value("Beta"))
                .andExpect(jsonPath("$.totalPages").value(2)).andExpect(jsonPath("$.number").value(1));
        mvc.perform(get("/api/v1/books").header("Authorization", "Bearer " + token).param("available", "false"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].title").value("Beta"));
        mvc.perform(get("/api/v1/books").header("Authorization", "Bearer " + token).param("title", "' OR 1=1 --"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content").isEmpty());
    }

    @Test
    void administratorCanReadUsersAndReceivesValidatedErrors() throws Exception {
        String token = login(Role.ADMIN);
        mvc.perform(get("/api/v1/users").header("Authorization", "Bearer " + token).param("sort", "email,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content[0].passwordHash").doesNotExist());
        UUID missing = UUID.randomUUID();
        mvc.perform(get("/api/v1/users/" + missing).header("Authorization", "Bearer " + token)).andExpect(status().isNotFound());
        mvc.perform(patch("/api/v1/users/" + missing + "/role").header("Authorization", "Bearer " + token).contentType("application/json").content("{\"role\":\"OWNER\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(patch("/api/v1/users/" + missing + "/status").header("Authorization", "Bearer " + token).contentType("application/json").content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void documentsPublicAuthenticationAndCreatedResponses() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.paths['/api/v1/auth/login'].post.security").isEmpty())
                .andExpect(jsonPath("$.paths['/api/v1/auth/register'].post.responses['201']").exists())
                .andExpect(jsonPath("$.paths['/api/v1/books/{id}'].delete.responses['204']").exists());
    }

    private BookResponse create(String token, BookRequest book) throws Exception {
        String body = mvc.perform(post("/api/v1/books").header("Authorization", "Bearer " + token).contentType("application/json").content(mapper.writeValueAsString(book)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return mapper.readValue(body, BookResponse.class);
    }

    String login(Role role) throws Exception {
        String email = UUID.randomUUID() + "@example.test";
        User user = new User("Operator", email, passwords.encode("integration-passphrase"), Instant.now());
        user.changeRole(role, Instant.now());
        users.saveAndFlush(user);
        String body = mvc.perform(post("/api/v1/auth/login").header("X-Requested-With", "XMLHttpRequest")
                .contentType("application/json").content(mapper.writeValueAsString(new LoginRequest(email, "integration-passphrase"))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return mapper.readTree(body).get("accessToken").asString();
    }

    private static String secret() {
        byte[] bytes = new byte[32]; new SecureRandom().nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }
}
