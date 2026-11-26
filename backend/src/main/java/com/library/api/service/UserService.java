package com.library.api.service;

import com.library.api.dto.*;
import com.library.api.entity.Role;
import com.library.api.entity.User;
import com.library.api.mapper.UserMapper;
import com.library.api.exception.ApiException;
import org.springframework.http.HttpStatus;
import com.library.api.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository users;
    private final RefreshTokenRepository sessions;
    private final Clock clock;
    public UserService(UserRepository users, RefreshTokenRepository sessions, Clock clock) {
        this.users = users; this.sessions = sessions; this.clock = clock;
    }
    public UserResponse get(UUID id) { return UserMapper.toResponse(find(id)); }
    public PageResponse<UserResponse> list(Pageable page) { return PageResponse.from(users.findAll(page).map(UserMapper::toResponse)); }
    @Transactional
    public UserResponse changeRole(UUID id, Role role) {
        User user = find(id);
        user.changeRole(role, clock.instant());
        sessions.revokeUser(id, clock.instant());
        return UserMapper.toResponse(user);
    }
    @Transactional
    public UserResponse changeStatus(UUID id, boolean active) {
        User user = find(id);
        user.changeStatus(active, clock.instant());
        sessions.revokeUser(id, clock.instant());
        return UserMapper.toResponse(user);
    }

    private User find(UUID id) {
        return users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }
}
