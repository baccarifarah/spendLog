"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

export function TablePagination({
    currentPage,
    totalCount,
    pageSize,
    onPageChange,
    onPageSizeChange
}: TablePaginationProps) {
    const totalPages = Math.ceil(totalCount / pageSize);

    if (totalCount === 0 || totalPages <= 1) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-foreground">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> to <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-semibold text-foreground">{totalCount}</span> entries
            </div>
            <div className="flex items-center space-x-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-background-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-border-theme"
                    title="First Page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-background-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-border-theme"
                    title="Previous Page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center px-4 h-9 rounded-lg border border-border-theme bg-background-secondary shadow-sm">
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">
                        Page {currentPage} of {totalPages}
                    </span>
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-background-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-border-theme"
                    title="Next Page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-background-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-border-theme"
                    title="Last Page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
