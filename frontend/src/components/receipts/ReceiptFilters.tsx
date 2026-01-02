
"use client";

import { Search, Plus, Filter }
    from "lucide-react";

interface FilterState {
    search: string;
    category: string;
    merchant: string;
}

interface ReceiptFiltersProps {
    filters: FilterState;
    onFilterChange: (key: keyof FilterState, value: string) => void;
}

const CATEGORIES = [
    "Food",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Health",
    "Housing",
    "Travel",
    "Work",
    "Bills",
    "Fitness",
    "Uncategorized",
];

export function ReceiptFilters({ filters, onFilterChange }: ReceiptFiltersProps) {
    return (
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 md:max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-lg border border-border-theme bg-background-secondary p-2.5 pl-10 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors dark:placeholder-gray-400"
                        placeholder="Search receipts..."
                        value={filters.search}
                        onChange={(e) => onFilterChange("search", e.target.value)}
                    />
                </div>

                {/* Filters Button (Mobile) or Row (Desktop) could go here, simplified to direct inputs */}
                <div className="flex gap-2">
                    <select
                        className="rounded-lg border border-border-theme bg-background-secondary p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                        value={filters.category}
                        onChange={(e) => onFilterChange("category", e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
