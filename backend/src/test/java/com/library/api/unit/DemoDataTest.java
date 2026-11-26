package com.library.api.unit;

import com.library.api.config.DemoData;
import com.library.api.dto.BookResponse;
import com.library.api.entity.Book;
import com.library.api.repository.BookRepository;
import com.library.api.service.BookService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import java.time.Clock;
import java.util.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DemoDataTest {
    @Test
    void seedsAnEmptyCatalogOnlyOnce() {
        BookRepository books = mock(BookRepository.class);
        Map<UUID, Book> stored = new HashMap<>();
        when(books.count()).thenAnswer(invocation -> (long) stored.size());
        when(books.saveAndFlush(any())).thenAnswer(invocation -> { Book book = invocation.getArgument(0); stored.put(book.getId(), book); return book; });
        when(books.findById(any())).thenAnswer(invocation -> Optional.ofNullable(stored.get(invocation.getArgument(0))));
        BookService service = new BookService(books, Clock.systemUTC());
        DemoData initializer = new DemoData(books, service);
        initializer.run(new DefaultApplicationArguments());
        initializer.run(new DefaultApplicationArguments());
        assertThat(stored).hasSize(2);
        assertThat(stored.keySet().stream().map(service::get).map(BookResponse::isbn))
                .containsExactlyInAnyOrder("9780132350884", "9780201616224");
    }
}
