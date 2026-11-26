package com.library.api.unit;

import com.library.api.dto.BookRequest;
import com.library.api.entity.Book;
import com.library.api.exception.ApiException;
import com.library.api.repository.BookRepository;
import com.library.api.service.BookService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BookServiceTest {
    private final BookRepository repository = mock(BookRepository.class);
    private final Clock clock = Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);
    private final BookService service = new BookService(repository, clock);

    @Test
    void createValidBook() {
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var result = service.create(validRequest());
        assertThat(result.id()).isNotNull();
        assertThat(result.title()).isEqualTo("Clean Code");
        assertThat(result.isbn()).isEqualTo("9780132350884");
        assertThat(result.createdAt()).isEqualTo(clock.instant());
    }

    @Test
    void rejectsDuplicateIsbn() {
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(repository.findByIsbn("9780132350884")).thenReturn(Optional.of(new Book(validRequest(), clock.instant())));
        BookRequest request = validRequest();
        assertThatThrownBy(() -> service.create(request)).isInstanceOf(ApiException.class)
                .hasMessage("ISBN já cadastrado.");
    }

    @ParameterizedTest
    @MethodSource("invalidRequests")
    void rejectsInvalidInput(BookRequest request) {
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        assertThatThrownBy(() -> service.create(request)).isInstanceOf(IllegalArgumentException.class);
    }

    static Stream<BookRequest> invalidRequests() {
        return Stream.of(
                new BookRequest("", "Author", "9780132350884", null, 2008, null, null, 1, 1),
                new BookRequest("Title", " ", "9780132350884", null, 2008, null, null, 1, 1),
                new BookRequest("Title", "Author", "9780132350884", null, 2027, null, null, 1, 1),
                new BookRequest("Title", "Author", "9780132350884", null, 0, null, null, 1, 1),
                new BookRequest("Title", "Author", "9780132350884", null, 2008, null, null, -1, 0),
                new BookRequest("Title", "Author", "9780132350884", null, 2008, null, null, 1, -1),
                new BookRequest("Title", "Author", "9780132350884", null, 2008, null, null, 1, 2),
                new BookRequest(null, "Author", "9780132350884", null, 2008, null, null, 1, 1),
                new BookRequest("Title", null, "9780132350884", null, 2008, null, null, 1, 1),
                new BookRequest("Title", "Author", "9780132350884", null, null, null, null, 1, 1),
                new BookRequest("Title", "Author", "9780132350884", null, 2008, null, null, null, 1),
                new BookRequest("Title", "Author", "9780132350884", null, 2008, null, null, 1, null));
    }

    @Test
    void updateAndDelete() {
        Book book = new Book(validRequest(), clock.instant());
        when(repository.findById(book.getId())).thenReturn(Optional.of(book));
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        assertThat(service.get(book.getId()).title()).isEqualTo("Clean Code");
        BookRequest replacement = new BookRequest("Novo título", "Robert Martin", "9780132350884", "Pearson",
                2008, "Engenharia", "Descrição", 5, 0);
        assertThat(service.update(book.getId(), replacement).availableCopies()).isZero();
        assertThat(service.get(book.getId()).title()).isEqualTo("Novo título");
        doAnswer(invocation -> { when(repository.findById(book.getId())).thenReturn(Optional.empty()); return null; })
                .when(repository).delete(book);
        service.delete(book.getId());
        UUID deletedId = book.getId();
        assertThatThrownBy(() -> service.get(deletedId)).isInstanceOf(ApiException.class)
                .hasMessage("Livro não encontrado.");
    }

    @Test
    void updateRejectsAnotherBooksIsbnButRetainsItsOwn() {
        Book book = new Book(validRequest(), clock.instant());
        when(repository.findById(book.getId())).thenReturn(Optional.of(book));
        when(repository.findByIsbn("9780132350884")).thenReturn(Optional.of(book));
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        assertThat(service.update(book.getId(), validRequest()).id()).isEqualTo(book.getId());
        when(repository.findByIsbn("9780132350884")).thenReturn(Optional.of(new Book(validRequest(), clock.instant())));
        UUID id = book.getId();
        UUID missingId = UUID.randomUUID();
        BookRequest request = validRequest();
        assertThatThrownBy(() -> service.update(id, request)).isInstanceOf(ApiException.class)
                .hasMessage("ISBN já cadastrado.");
        assertThatThrownBy(() -> service.update(missingId, request)).isInstanceOf(ApiException.class)
                .hasMessage("Livro não encontrado.");
    }

    private BookRequest validRequest() {
        return new BookRequest("Clean Code", "Robert Martin", "978-0-13-235088-4", "Pearson",
                2008, "Engenharia", "Código legível", 5, 3);
    }
}
