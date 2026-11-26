package com.library.api.dto;

import jakarta.validation.constraints.Size;

public record BookFilter(@Size(max = 200) String title, @Size(max = 150) String author,
        @Size(max = 32) String isbn, @Size(max = 100) String category, Boolean available) { }
