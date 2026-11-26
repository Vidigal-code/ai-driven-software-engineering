package com.library.api.config;

import com.library.api.repository.UserRepository;
import com.library.api.entity.User;
import com.library.api.entity.Role;
import com.library.api.dto.RegisterRequest;
import jakarta.validation.Validator;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.Clock;
import java.util.Locale;
import java.nio.charset.StandardCharsets;

@Component
@ConditionalOnProperty(name = "library.bootstrap.enabled", havingValue = "true")
public class BootstrapAdmin implements ApplicationRunner {
    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final Clock clock;
    private final BootstrapProperties properties;
    private final Validator validator;
    public BootstrapAdmin(UserRepository users, PasswordEncoder passwords, Clock clock, BootstrapProperties properties, Validator validator) {
        this.users = users; this.passwords = passwords; this.clock = clock; this.properties = properties; this.validator = validator;
    }
    @Override
    public void run(ApplicationArguments arguments) {
        if (!properties.enabled()) { return; }
        var request = new RegisterRequest(properties.name(), properties.email(), properties.password());
        if (!validator.validate(request).isEmpty() || properties.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("Configure nome, email e senha válidos para bootstrap administrativo.");
        }
        String email = properties.email().trim().toLowerCase(Locale.ROOT);
        if (users.findByEmail(email).isPresent()) { return; }
        User user = new User(properties.name().trim(), email, passwords.encode(properties.password()), clock.instant());
        user.changeRole(Role.ADMIN, clock.instant());
        users.saveAndFlush(user);
    }
}
