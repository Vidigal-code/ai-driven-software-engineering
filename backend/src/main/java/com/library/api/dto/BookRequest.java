package com.library.api.dto;

import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;

public record BookRequest(
        @Schema(example = "Clean Code") @NotBlank @Size(max = 200) String title,
        @Schema(example = "Robert C. Martin") @NotBlank @Size(max = 150) String author,
        @Schema(example = "9780132350884", description = "ISBN10/13 com checksum válido; retornado como ISBN13 canônico.") @NotBlank @Size(max = 32) String isbn,
        @Size(max = 150) String publisher,
        @NotNull @Min(1) Integer publicationYear,
        @Size(max = 100) String category,
        @Size(max = 5000) String description,
        @NotNull @PositiveOrZero Integer totalCopies,
        @NotNull @PositiveOrZero Integer availableCopies) { }
