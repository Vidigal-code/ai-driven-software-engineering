package com.library.api.service;

import com.library.api.dto.BookFilter;
import com.library.api.entity.Book;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.util.ArrayList;
import java.util.Locale;

public final class BookSearch {
    private BookSearch() { }

    public static Specification<Book> matching(BookFilter filter) {
        return (root, query, builder) -> {
            var predicates = new ArrayList<Predicate>();
            if (hasText(filter.title())) {
                predicates.add(builder.like(builder.lower(root.get("title")), contains(filter.title()), '\\'));
            }
            if (hasText(filter.author())) {
                predicates.add(builder.like(builder.lower(root.get("author")), contains(filter.author()), '\\'));
            }
            if (hasText(filter.isbn())) {
                predicates.add(builder.like(root.get("isbn"), contains(BookRules.normalizeIsbnSearch(filter.isbn())), '\\'));
            }
            if (hasText(filter.category())) {
                predicates.add(builder.equal(builder.lower(root.get("category")), filter.category().trim().toLowerCase(Locale.ROOT)));
            }
            if (filter.available() != null) {
                predicates.add(Boolean.TRUE.equals(filter.available()) ? builder.greaterThan(root.get("availableCopies"), 0)
                        : builder.equal(root.get("availableCopies"), 0));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static boolean hasText(String value) { return value != null && !value.isBlank(); }

    private static String contains(String value) {
        return "%" + value.trim().toLowerCase(Locale.ROOT).replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
    }
}
