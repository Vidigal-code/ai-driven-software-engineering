package com.library.api.entity;

import com.library.api.dto.BookRequest;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "books")
public class Book {
    @Id private UUID id;
    private String title;
    private String author;
    private String isbn;
    private String publisher;
    private int publicationYear;
    private String category;
    @Column(length = 5000) private String description;
    private int totalCopies;
    private int availableCopies;
    private Instant createdAt;
    private Instant updatedAt;
    @Version private long version;

    protected Book() { }

    public Book(BookRequest request, Instant now) {
        id = UUID.randomUUID();
        createdAt = now;
        update(request, now);
    }

    public void update(BookRequest request, Instant now) {
        title = request.title();
        author = request.author();
        isbn = request.isbn();
        publisher = request.publisher();
        publicationYear = request.publicationYear();
        category = request.category();
        description = request.description();
        totalCopies = request.totalCopies();
        availableCopies = request.availableCopies();
        updatedAt = now;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getIsbn() { return isbn; }
    public String getPublisher() { return publisher; }
    public int getPublicationYear() { return publicationYear; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public int getTotalCopies() { return totalCopies; }
    public int getAvailableCopies() { return availableCopies; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
