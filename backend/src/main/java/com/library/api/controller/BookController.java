package com.library.api.controller;

import com.library.api.dto.*;
import com.library.api.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/books")
@Tag(name = "Books")
public class BookController {
    private final BookService books;
    private final Pagination pagination;

    public BookController(BookService books, Pagination pagination) { this.books = books; this.pagination = pagination; }

    @PostMapping
    @Operation(summary = "Cadastrar livro")
    public ResponseEntity<BookResponse> create(@Valid @RequestBody BookRequest request) {
        var book = books.create(request);
        return ResponseEntity.created(URI.create("/api/v1/books/" + book.id())).body(book);
    }

    @GetMapping
    @Operation(summary = "Pesquisar acervo paginado", description = "Filtros combinados por AND; sort=campo,asc ou campo,desc; page inicia em zero.")
    public PageResponse<BookResponse> search(@Valid @ModelAttribute @ParameterObject BookFilter filter,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return books.search(filter, pagination.parse(new PageInput(page, size, sort), SortFields.BOOKS));
    }

    @GetMapping("/{id}") @Operation(summary = "Consultar livro")
    public BookResponse get(@PathVariable UUID id) { return books.get(id); }

    @PutMapping("/{id}") @Operation(summary = "Atualizar livro")
    public BookResponse update(@PathVariable UUID id, @Valid @RequestBody BookRequest request) { return books.update(id, request); }

    @DeleteMapping("/{id}") @Operation(summary = "Excluir livro")
    public ResponseEntity<Void> delete(@PathVariable UUID id) { books.delete(id); return ResponseEntity.noContent().build(); }
}
