package com.library.api.service;

import java.util.Set;

public final class SortFields {
    public static final Set<String> BOOKS = Set.of("title", "author", "isbn", "category", "publicationYear",
            "totalCopies", "availableCopies", "createdAt", "updatedAt");
    public static final Set<String> USERS = Set.of("name", "email", "role", "active", "createdAt");
    private SortFields() { }
}
