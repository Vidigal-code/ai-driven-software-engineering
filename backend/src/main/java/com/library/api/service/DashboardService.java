package com.library.api.service;

import com.library.api.dto.DashboardSummary;
import com.library.api.repository.BookRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.library.api.mapper.BookMapper;

@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final BookRepository books;
    private final int recentLimit;
    public DashboardService(BookRepository books, @Value("${library.dashboard.recent-limit}") int recentLimit) {
        this.books = books; this.recentLimit = recentLimit;
    }
    public DashboardSummary summary() {
        var totals = books.summarize();
        var recent = books.findAll(PageRequest.of(0, recentLimit, Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by("id"))))
                .map(BookMapper::toResponse).getContent();
        return new DashboardSummary(totals.totalTitles(), totals.totalCopies(), totals.availableCopies(),
                totals.totalCopies() - totals.availableCopies(), totals.totalCategories(), recent);
    }
}
