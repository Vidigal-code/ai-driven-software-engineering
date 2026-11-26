package com.library.api.unit;

import com.library.api.dto.DashboardTotals;
import com.library.api.repository.BookRepository;
import com.library.api.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DashboardServiceTest {
    @Test
    void summarizesRealInventory() {
        BookRepository books = mock(BookRepository.class);
        when(books.summarize()).thenReturn(new DashboardTotals(4, 12, 5, 2));
        when(books.findAll(any(Pageable.class))).thenReturn(Page.empty());
        var summary = new DashboardService(books, 5).summary();
        assertThat(summary.totalTitles()).isEqualTo(4);
        assertThat(summary.totalCopies()).isEqualTo(12);
        assertThat(summary.availableCopies()).isEqualTo(5);
        assertThat(summary.unavailableCopies()).isEqualTo(7);
        assertThat(summary.totalCategories()).isEqualTo(2);
        assertThat(summary.recentBooks()).isEmpty();
    }
}
