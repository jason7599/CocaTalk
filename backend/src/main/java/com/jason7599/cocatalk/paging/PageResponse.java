package com.jason7599.cocatalk.paging;

import org.springframework.data.domain.Page;

import java.util.List;

public record PageResponse<T>(
        List<T> content,
        int currentPage,
        int totalPages,
        long totalItems,
        boolean isLast
) {
    public PageResponse(Page<T> page) {
        this(
                page.getContent(),
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements(),
                page.isLast()
        );
    }
}
