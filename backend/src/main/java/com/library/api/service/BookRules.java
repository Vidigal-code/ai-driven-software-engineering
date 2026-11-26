package com.library.api.service;

import java.util.Locale;
import java.time.Clock;
import java.time.Year;
import com.library.api.dto.BookRequest;

public final class BookRules {
    private BookRules() { }

    public static BookRequest normalize(BookRequest request, Clock clock) {
        if (request.title() == null || request.title().isBlank()
                || request.author() == null || request.author().isBlank()) {
            throw new IllegalArgumentException("Título e autor são obrigatórios.");
        }
        if (request.publicationYear() == null || request.publicationYear() < 1
                || request.publicationYear() > Year.now(clock).getValue()) {
            throw new IllegalArgumentException("Ano de publicação inválido.");
        }
        if (request.totalCopies() == null || request.availableCopies() == null
                || request.totalCopies() < 0 || request.availableCopies() < 0
                || request.availableCopies() > request.totalCopies()) {
            throw new IllegalArgumentException("Quantidades de exemplares inválidas.");
        }
        return new BookRequest(request.title().trim(), request.author().trim(), normalizeIsbn(request.isbn()),
                trimOptional(request.publisher()), request.publicationYear(), trimOptional(request.category()),
                trimOptional(request.description()), request.totalCopies(), request.availableCopies());
    }

    private static String trimOptional(String value) {
        return value == null ? "" : value.trim();
    }

    public static String normalizeIsbn(String value) {
        if (value == null) {
            throw new IllegalArgumentException("ISBN é obrigatório.");
        }
        String isbn = value.replaceAll("[\\s-]", "").toUpperCase(Locale.ROOT);
        if (isbn.matches("\\d{9}[\\dX]") && validIsbn10(isbn)) {
            String base = "978" + isbn.substring(0, 9);
            return base + ((10 - weightedSum13(base) % 10) % 10);
        }
        boolean valid = isbn.matches("97[89]\\d{10}") && validIsbn13(isbn);
        if (!valid) {
            throw new IllegalArgumentException("ISBN inválido.");
        }
        return isbn;
    }

    public static String normalizeIsbnSearch(String value) {
        String isbn = value.replaceAll("[\\s-]", "").toUpperCase(Locale.ROOT);
        return isbn.matches("\\d{9}[\\dX]") && validIsbn10(isbn) ? normalizeIsbn(isbn) : isbn;
    }

    private static boolean validIsbn10(String isbn) {
        int sum = 0;
        for (int index = 0; index < isbn.length(); index++) {
            char character = isbn.charAt(index);
            int digit = character == 'X' ? 10 : Character.digit(character, 10);
            sum += digit * (10 - index);
        }
        return sum % 11 == 0;
    }

    private static boolean validIsbn13(String isbn) {
        return weightedSum13(isbn) % 10 == 0;
    }

    private static int weightedSum13(String isbn) {
        int sum = 0;
        for (int index = 0; index < isbn.length(); index++) {
            int weight = index % 2 == 0 ? 1 : 3;
            sum += Character.digit(isbn.charAt(index), 10) * weight;
        }
        return sum;
    }
}
