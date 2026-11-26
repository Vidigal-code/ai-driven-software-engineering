package com.library.api.unit;

import com.library.api.security.AuthAttemptLimiter;
import com.library.api.security.AuthRequestFilter;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import tools.jackson.databind.json.JsonMapper;
import static org.assertj.core.api.Assertions.assertThat;

class AuthRequestFilterTest {
    private static final String ORIGIN = "https://library.example.test";

    private AuthRequestFilter filter() {
        var limiter = new AuthAttemptLimiter(Clock.systemUTC(), new AuthAttemptLimiter.Policy(2, Duration.ofMinutes(1), 10));
        return new AuthRequestFilter(limiter, List.of(ORIGIN), new JsonMapper());
    }

    @Test
    void rejectsCookieMutationWithoutTheRequiredHeader() throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/refresh");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter().doFilter(request, response, chain);
        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentType()).startsWith("application/problem+json");
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void rejectsAnOriginOutsideTheAllowlistDespiteTheCustomHeader() throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.addHeader("X-Requested-With", "XMLHttpRequest");
        request.addHeader("Origin", "https://untrusted.example.test");
        var response = new MockHttpServletResponse();
        filter().doFilter(request, response, new MockFilterChain());
        assertThat(response.getStatus()).isEqualTo(403);
    }

    @Test
    void rejectsEncodedAuthenticationPathWithoutTheRequiredHeader() throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/%72efresh");
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter().doFilter(request, response, chain);
        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(chain.getRequest()).isNull();
    }

    @ParameterizedTest
    @CsvSource({"GET,/api/v1/books", "POST,/api/v1/books", "OPTIONS,/api/v1/auth/login", "GET,/api/v1/auth/me"})
    void leavesNonAuthenticationPostsAndPreflightToTheSecurityChain(String method, String path) throws Exception {
        var request = new MockHttpServletRequest(method, path);
        var response = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter().doFilter(request, response, chain);
        assertThat(chain.getRequest()).isSameAs(request);
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void limitsCredentialAttemptsButAllowsRefreshWithAnApprovedOrigin() throws Exception {
        var filter = filter();
        for (int attempt = 0; attempt < 2; attempt++) {
            var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            request.addHeader("X-Requested-With", "XMLHttpRequest");
            request.addHeader("Origin", ORIGIN);
            var chain = new MockFilterChain();
            filter.doFilter(request, new MockHttpServletResponse(), chain);
            assertThat(chain.getRequest()).isSameAs(request);
        }
        var blocked = new MockHttpServletRequest("POST", "/api/v1/auth/register");
        blocked.addHeader("X-Requested-With", "XMLHttpRequest");
        var response = new MockHttpServletResponse();
        filter.doFilter(blocked, response, new MockFilterChain());
        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isEqualTo("60");
        var refresh = new MockHttpServletRequest("POST", "/api/v1/auth/refresh");
        refresh.addHeader("X-Requested-With", "XMLHttpRequest");
        var chain = new MockFilterChain();
        filter.doFilter(refresh, new MockHttpServletResponse(), chain);
        assertThat(chain.getRequest()).isSameAs(refresh);
    }
}
