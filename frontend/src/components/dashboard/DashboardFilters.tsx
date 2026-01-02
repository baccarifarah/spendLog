"use client";

import { Calendar, X } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

interface DashboardFiltersProps {
    onFilterChange: (startDate: string | undefined, endDate: string | undefined) => void;
}

type Period = "today" | "week" | "month" | "last30" | "all" | "custom";

export function DashboardFilters({ onFilterChange }: DashboardFiltersProps) {
    const [period, setPeriod] = useState<Period>("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handlePeriodChange = (newPeriod: Period) => {
        setPeriod(newPeriod);

        const now = new Date();
        let start: Date | undefined;
        let end: Date | undefined = now;

        switch (newPeriod) {
            case "today":
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case "week":
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                start = new Date(now.getFullYear(), now.getMonth(), diff);
                break;
            case "month":
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "last30":
                start = new Date();
                start.setDate(now.getDate() - 30);
                break;
            case "all":
                start = undefined;
                end = undefined;
                break;
            case "custom":
                return;
        }

        const startStr = start ? formatDate(start) : undefined;
        const endStr = end ? formatDate(end) : undefined;
        onFilterChange(startStr, endStr);
    };

    return (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border-theme bg-background-secondary p-3 shadow-sm">
            <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <select
                    value={period}
                    onChange={(e) => handlePeriodChange(e.target.value as Period)}
                    className="bg-transparent text-sm font-bold text-foreground focus:outline-none cursor-pointer appearance-none pr-8 relative"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0 center',
                        backgroundSize: '1.2em'
                    }}
                >
                    <option value="today" className="bg-background text-foreground">Today</option>
                    <option value="week" className="bg-background text-foreground">Week</option>
                    <option value="month" className="bg-background text-foreground">Month</option>
                    <option value="last30" className="bg-background text-foreground">Last30</option>
                    <option value="all" className="bg-background text-foreground">All</option>
                    <option value="custom" className="bg-background text-foreground">Custom</option>
                </select>
            </div>

            {period === "custom" && (
                <div className="flex items-center gap-2 border-l border-border-theme pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                            setStartDate(e.target.value);
                            if (e.target.value && endDate) onFilterChange(e.target.value, endDate);
                        }}
                        className="rounded-lg border border-border-theme bg-background px-3 py-1.5 text-xs text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                            setEndDate(e.target.value);
                            if (startDate && e.target.value) onFilterChange(startDate, e.target.value);
                        }}
                        className="rounded-lg border border-border-theme bg-background px-3 py-1.5 text-xs text-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            )}
        </div>
    );
}
