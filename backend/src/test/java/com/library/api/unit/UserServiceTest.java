package com.library.api.unit;

import com.library.api.entity.*;
import com.library.api.repository.*;
import com.library.api.service.UserService;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class UserServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final RefreshTokenRepository sessions = mock(RefreshTokenRepository.class);
    private final Clock clock = Clock.fixed(Instant.parse("2026-11-26T12:00:00Z"), ZoneOffset.UTC);
    private final UserService service = new UserService(users, sessions, clock);

    @Test
    void changesRoleAndStatus() {
        User user = new User("Reader", "reader@example.test", "unused", clock.instant());
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        assertThat(service.get(user.getId()).role()).isEqualTo(Role.READER);
        assertThat(service.changeRole(user.getId(), Role.LIBRARIAN).role()).isEqualTo(Role.LIBRARIAN);
        assertThat(service.changeStatus(user.getId(), false).active()).isFalse();
        assertThat(service.get(user.getId()).active()).isFalse();
    }
}
