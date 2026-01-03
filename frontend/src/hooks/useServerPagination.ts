"use client";

import { useState, useCallback } from "react";

export interface PaginationState {
    page: number;
    pageSize: number;
    sortBy: string;
    order: "asc" | "desc";
    skip: number;
}

export function useServerPagination(initialSize = 10, defaultSort = "date") {
    const [state, setState] = useState({
        page: 1,
        pageSize: initialSize,
        sortBy: defaultSort,
        order: "desc" as "asc" | "desc"
    });

    const onPageChange = useCallback((newPage: number) => {
        setState(prev => ({ ...prev, page: newPage }));
    }, []);

    const onSort = useCallback((column: string) => {
        setState(prev => ({
            ...prev,
            sortBy: column,
            order: prev.sortBy === column && prev.order === "desc" ? "asc" : "desc",
            page: 1 // Reset to first page on sort change
        }));
    }, []);

    const skip = (state.page - 1) * state.pageSize;

    return {
        ...state,
        skip,
        onPageChange,
        onSort,
        setPage: (page: number) => setState(prev => ({ ...prev, page })),
        setPageSize: (pageSize: number) => setState(prev => ({ ...prev, pageSize, page: 1 })),
    };
}
