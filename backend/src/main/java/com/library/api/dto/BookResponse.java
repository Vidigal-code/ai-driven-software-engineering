package com.library.api.dto;

import java.time.Instant;
import java.util.UUID;

public record BookResponse(UUID id, String title, String author, String isbn, String publisher,
        int publicationYear, String category, String description, int totalCopies,
        int availableCopies, Instant createdAt, Instant updatedAt) { }
