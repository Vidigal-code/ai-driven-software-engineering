package com.library.api.mapper;

import com.library.api.dto.UserResponse;
import com.library.api.entity.User;

public final class UserMapper {
    private UserMapper() { }
    public static UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.isActive(), user.getCreatedAt(), user.getUpdatedAt());
    }
}
