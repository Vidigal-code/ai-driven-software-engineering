package com.library.api.dto;

import java.util.List;

public record DashboardSummary(long totalTitles, long totalCopies, long availableCopies, long unavailableCopies,
        long totalCategories, List<BookResponse> recentBooks) {
    public DashboardSummary { recentBooks = List.copyOf(recentBooks); }
}
