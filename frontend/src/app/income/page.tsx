
"use client";

import { useEffect, useState } from "react";
import { api, Income, IncomeCreate } from "@/lib/api";
import { IncomeTable } from "@/components/income/IncomeTable";
import { IncomeFilters } from "@/components/income/IncomeFilters";
import { IncomeModal } from "@/components/income/IncomeModal";
import { useToast } from "@/context/ToastContext";
import {
    Wallet,
    TrendingUp,
    ArrowUpCircle,
    BarChart3,
    DollarSign,
    Plus
} from "lucide-react";
import { MiniStatsCard } from "@/components/dashboard/MiniStatsCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useCurrency } from "@/context/CurrencyContext";

export default function IncomePage() {
    const { showToast } = useToast();
    const { formatAmount } = useCurrency();
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        search: "",
        category: "",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);

    const fetchIncomes = async () => {
        try {
            setLoading(true);
            const data = await api.getIncomes({
                limit: 100,
                category: filters.category || undefined,
            });
            setIncomes(data);
        } catch (err: any) {
            setError(err.message || "Failed to load income entries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, [filters.category]);

    const filteredIncomes = incomes.filter((income) => {
        const searchLower = filters.search.toLowerCase();
        return (
            income.source.toLowerCase().includes(searchLower) ||
            (income.description && income.description.toLowerCase().includes(searchLower)) ||
            income.amount.toString().includes(searchLower)
        );
    });

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (data: IncomeCreate | Partial<IncomeCreate>) => {
        try {
            if (editingIncome) {
                await api.updateIncome(editingIncome.id, data);
                showToast("Income entry updated successfully", "success");
            } else {
                await api.createIncome(data as IncomeCreate);
                showToast("Income entry created successfully", "success");
            }
            await fetchIncomes();
        } catch (err: any) {
            showToast(err.message || "Operation failed", "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this income entry?")) {
            try {
                await api.deleteIncome(id);
                showToast("Income entry deleted successfully", "success");
                await fetchIncomes();
            } catch (err: any) {
                showToast(err.message || "Delete failed", "error");
            }
        }
    };

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const avgIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const maxIncome = incomes.length > 0 ? Math.max(...incomes.map(i => i.amount)) : 0;

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Income Management</h1>
                    <p className="text-muted-foreground">Monitor and manage your revenue streams</p>
                </div>
                <button
                    onClick={() => {
                        setEditingIncome(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-colors shadow-sm dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer"
                >
                    <Plus className="h-5 w-5" />
                    Add Income
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="Total Income"
                    value={formatAmount(totalIncome)}
                    icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                />
                <StatsCard
                    title="Entries"
                    value={incomes.length.toString()}
                    icon={<Wallet className="h-5 w-5 text-blue-500" />}
                />
                <StatsCard
                    title="Max Single Entry"
                    value={formatAmount(maxIncome)}
                    icon={<ArrowUpCircle className="h-5 w-5 text-orange-500" />}
                />
            </div>

            <div className="rounded-xl border border-border-theme bg-background p-6 shadow-sm transition-colors">
                <IncomeFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : error ? (
                    <div className="flex h-64 flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/20">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">Error Loading Incomes</h3>
                        <p className="text-sm text-gray-500">{error}</p>
                    </div>
                ) : (
                    <IncomeTable
                        incomes={filteredIncomes}
                        onEdit={(income) => {
                            setEditingIncome(income);
                            setIsModalOpen(true);
                        }}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            <IncomeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingIncome}
            />
        </div>
    );
}
