package com.library.api.mapper;

import com.library.api.dto.BookResponse;
import com.library.api.entity.Book;

public final class BookMapper {
    private BookMapper() { }

    public static BookResponse toResponse(Book book) {
        return new BookResponse(book.getId(), book.getTitle(), book.getAuthor(), book.getIsbn(),
                book.getPublisher(), book.getPublicationYear(), book.getCategory(), book.getDescription(),
                book.getTotalCopies(), book.getAvailableCopies(), book.getCreatedAt(), book.getUpdatedAt());
    }
}
