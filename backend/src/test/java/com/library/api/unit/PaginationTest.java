package com.library.api.unit;

import com.library.api.dto.PageInput;
import com.library.api.service.Pagination;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.util.Set;
import static org.assertj.core.api.Assertions.*;

class PaginationTest {
    private final Pagination pagination = new Pagination(100);

    @Test
    void parsesSafePageAndSort() {
        var page = pagination.parse(new PageInput(2, 20, "title,desc"), Set.of("title"));
        assertThat(page.getPageNumber()).isEqualTo(2);
        assertThat(page.getPageSize()).isEqualTo(20);
        assertThat(page.getSort().getOrderFor("title").isDescending()).isTrue();
    }

    @ParameterizedTest
    @CsvSource({"-1,20,title,asc", "0,0,title,asc", "0,101,title,asc", "0,20,passwordHash,asc", "0,20,title,up"})
    void rejectsUnsafePageAndSort(int page, int size, String field, String direction) {
        var input = new PageInput(page, size, field + "," + direction);
        var allowedFields = Set.of("title");
        assertThatThrownBy(() -> pagination.parse(input, allowedFields))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
