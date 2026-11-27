package com.library.api.controller;

import com.library.api.dto.*;
import com.library.api.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users")
public class UserController {
    private final UserService users;
    private final Pagination pagination;
    public UserController(UserService users, Pagination pagination) { this.users = users; this.pagination = pagination; }

    @GetMapping @Operation(summary = "Listar usuários — ADMIN")
    public PageResponse<UserResponse> list(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size, @RequestParam(defaultValue = "name,asc") String sort) {
        return users.list(pagination.parse(new PageInput(page, size, sort), SortFields.USERS));
    }

    @GetMapping("/{id}") @Operation(summary = "Consultar usuário — ADMIN")
    public UserResponse get(@PathVariable UUID id) { return users.get(id); }

    @PatchMapping("/{id}/role") @Operation(summary = "Alterar perfil — ADMIN")
    public UserResponse role(@PathVariable UUID id, @Valid @RequestBody RoleRequest request) { return users.changeRole(id, request.role()); }

    @PatchMapping("/{id}/status") @Operation(summary = "Alterar estado — ADMIN")
    public UserResponse status(@PathVariable UUID id, @Valid @RequestBody StatusRequest request) { return users.changeStatus(id, request.active()); }
}
