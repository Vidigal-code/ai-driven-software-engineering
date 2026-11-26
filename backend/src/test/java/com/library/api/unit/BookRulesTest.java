package com.library.api.unit;

import com.library.api.service.BookRules;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BookRulesTest {
    @Test
    void normalizesIsbn() {
        assertThat(BookRules.normalizeIsbn("978-0-13-235088-4")).isEqualTo("9780132350884");
    }

    @Test
    void convertsIsbn10ToCanonical13() {
        assertThat(BookRules.normalizeIsbn("0-13-235088-2")).isEqualTo("9780132350884");
        assertThat(BookRules.normalizeIsbn("0-8044-2957-x")).isEqualTo("9780804429573");
    }

    @ParameterizedTest
    @ValueSource(strings = {"0-13-235088-2", "0132350882"})
    void normalizesCompleteIsbnSearchAndPreservesFragments(String isbn10) {
        assertThat(BookRules.normalizeIsbnSearch(isbn10)).isEqualTo("9780132350884");
        assertThat(BookRules.normalizeIsbnSearch("978-0-13")).isEqualTo("978013");
        assertThat(BookRules.normalizeIsbnSearch("0132350888")).isEqualTo("0132350888");
        assertThat(BookRules.normalizeIsbnSearch("9780132350884")).isEqualTo("9780132350884");
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"9780132350885", "123", "978013235088A", "1234567890128", "0132350888", "   "})
    void rejectsInvalidIsbn(String value) {
        assertThatThrownBy(() -> BookRules.normalizeIsbn(value)).isInstanceOf(IllegalArgumentException.class);
    }
}
