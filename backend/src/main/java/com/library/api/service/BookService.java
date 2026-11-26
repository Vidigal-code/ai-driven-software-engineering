package com.library.api.service;

import com.library.api.dto.BookRequest;
import com.library.api.dto.BookResponse;
import com.library.api.dto.BookFilter;
import com.library.api.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import com.library.api.repository.BookRepository;
import com.library.api.entity.Book;
import com.library.api.mapper.BookMapper;
import com.library.api.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class BookService {
    private static final String DUPLICATE_ISBN = "ISBN já cadastrado.";
    private final BookRepository repository;
    private final Clock clock;

    public BookService(BookRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Transactional
    public BookResponse create(BookRequest request) {
        BookRequest normalized = BookRules.normalize(request, clock);
        if (repository.findByIsbn(normalized.isbn()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, DUPLICATE_ISBN);
        }
        return BookMapper.toResponse(repository.saveAndFlush(new Book(normalized, clock.instant())));
    }

    public BookResponse get(UUID id) { return BookMapper.toResponse(find(id)); }

    public PageResponse<BookResponse> search(BookFilter filter, Pageable pageable) {
        return PageResponse.from(repository.findAll(BookSearch.matching(filter), pageable).map(BookMapper::toResponse));
    }

    @Transactional
    public BookResponse update(UUID id, BookRequest request) {
        Book book = find(id);
        BookRequest normalized = BookRules.normalize(request, clock);
        repository.findByIsbn(normalized.isbn()).filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> { throw new ApiException(HttpStatus.CONFLICT, DUPLICATE_ISBN); });
        book.update(normalized, clock.instant());
        return BookMapper.toResponse(repository.saveAndFlush(book));
    }

    @Transactional
    public void delete(UUID id) { repository.delete(find(id)); }

    private Book find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Livro não encontrado."));
    }
}
