package com.library.api.service;

import com.library.api.dto.PageInput;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class Pagination {
    private final int maxSize;
    public Pagination(@Value("${library.pagination.max-size}") int maxSize) { this.maxSize = maxSize; }
    public Pageable parse(PageInput input, Set<String> allowedFields) {
        if (input.page() < 0 || input.size() < 1 || input.size() > maxSize) {
            throw new IllegalArgumentException("Paginação fora dos limites permitidos.");
        }
        String[] sort = input.sort().split(",", -1);
        if (sort.length != 2 || !allowedFields.contains(sort[0])
                || !(sort[1].equals("asc") || sort[1].equals("desc"))) {
            throw new IllegalArgumentException("Ordenação inválida; utilize campo,asc ou campo,desc.");
        }
        return PageRequest.of(input.page(), input.size(), Sort.by(Sort.Direction.fromString(sort[1]), sort[0]).and(Sort.by("id")));
    }
}
