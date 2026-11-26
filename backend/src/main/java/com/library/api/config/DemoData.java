package com.library.api.config;

import com.library.api.repository.BookRepository;
import com.library.api.dto.BookRequest;
import com.library.api.service.BookService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("demo")
@ConditionalOnProperty(name = "library.demo-data.enabled", havingValue = "true")
public class DemoData implements ApplicationRunner {
    private final BookRepository books;
    private final BookService service;
    public DemoData(BookRepository books, BookService service) { this.books = books; this.service = service; }
    @Override public void run(ApplicationArguments arguments) {
        if (books.count() != 0) { return; }
        service.create(new BookRequest("Clean Code", "Robert C. Martin", "9780132350884", "Pearson", 2008,
                "Engenharia de Software", "Acervo opcional de demonstração.", 6, 4));
        service.create(new BookRequest("The Pragmatic Programmer", "Andrew Hunt e David Thomas", "9780201616224", "Addison-Wesley", 1999,
                "Engenharia de Software", "Acervo opcional de demonstração.", 4, 2));
    }
}
