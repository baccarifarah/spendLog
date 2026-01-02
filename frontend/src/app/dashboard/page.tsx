"use client";

import { useEffect, useState } from "react";
import { api, DashboardData, Receipt } from "@/lib/api";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { FinanceOverview } from "@/components/dashboard/FinanceOverview";
import { RecentUploads } from "@/components/receipts/RecentUploads";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { useAuth } from "@/context/AuthContext";
import { clsx } from "clsx";

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [recentReceipts, setRecentReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [filters, setFilters] = useState<{ startDate?: string; endDate?: string }>({
        startDate: undefined,
        endDate: undefined,
    });

    useEffect(() => {
        async function fetchData() {
            // Avoid fetching if auth is not ready
            if (authLoading) return;
            if (!user) {
                setLoading(false);
                return;
            }

            console.log("📡 start fetching")
            setLoading(true);
            try {
                const [stats, receipts] = await Promise.all([
                    api.getDashboardStats(filters.startDate, filters.endDate),
                    api.getReceipts({ limit: 5 })
                ]);
                console.log("✅ fetch finished", stats, receipts)
                setData(stats);
                setRecentReceipts(receipts);
            } catch (err: any) {
                console.error("❌ fetch failed", err);
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [filters, user, authLoading]);

    const handleFilterChange = (startDate: string | undefined, endDate: string | undefined) => {
        setFilters({ startDate, endDate });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-gray-500">Overview of your spending habits.</p>
                </div>
                <DashboardFilters onFilterChange={handleFilterChange} />
            </div>

            {loading && !data ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
                </div>
            ) : error ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="text-red-500 dark:text-red-400">Error: {error}</div>
                </div>
            ) : data ? (
                <div className={clsx("space-y-8 transition-opacity duration-300", loading && "opacity-50")}>
                    <FinanceOverview
                        income={data.stats.total_income}
                        expenses={data.stats.total_spent}
                    />

                    <DashboardCharts data={data} />

                    <RecentUploads receipts={recentReceipts} />
                </div>
            ) : null}
        </div>
    );
}
