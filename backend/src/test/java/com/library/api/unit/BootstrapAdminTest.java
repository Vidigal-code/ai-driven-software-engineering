package com.library.api.unit;

import com.library.api.config.*;
import com.library.api.entity.*;
import com.library.api.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.Clock;
import java.util.*;
import jakarta.validation.Validation;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BootstrapAdminTest {
    @Test
    void createsOnlyExplicitlyConfiguredAdministrator() {
        UserRepository users = mock(UserRepository.class);
        List<User> stored = new ArrayList<>();
        when(users.saveAndFlush(any())).thenAnswer(invocation -> { User user = invocation.getArgument(0); stored.add(user); return user; });
        var properties = new BootstrapProperties(true, "Administrator", "admin@example.test", "bootstrap-passphrase-test");
        var encoder = new BCryptPasswordEncoder(4);
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            new BootstrapAdmin(users, encoder, Clock.systemUTC(), properties, factory.getValidator()).run(new DefaultApplicationArguments());
        }
        assertThat(stored).hasSize(1);
        assertThat(stored.getFirst().getRole()).isEqualTo(Role.ADMIN);
        assertThat(encoder.matches(properties.password(), stored.getFirst().getPasswordHash())).isTrue();
    }
}
