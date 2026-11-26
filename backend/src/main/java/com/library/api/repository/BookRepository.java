package com.library.api.repository;

import com.library.api.entity.Book;
import com.library.api.dto.DashboardTotals;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;
import java.util.UUID;

public interface BookRepository extends JpaRepository<Book, UUID>, JpaSpecificationExecutor<Book> {
    Optional<Book> findByIsbn(String isbn);
    @Query("select new com.library.api.dto.DashboardTotals(count(b), coalesce(sum(b.totalCopies), 0), coalesce(sum(b.availableCopies), 0), count(distinct nullif(b.category, ''))) from Book b")
    DashboardTotals summarize();
}
