
"use client";

import { useEffect, useState } from "react";
import { api, Income, IncomeCreate } from "@/lib/api";
import { IncomeTable } from "@/components/income/IncomeTable";
import { IncomeFilters } from "@/components/income/IncomeFilters";
import { IncomeModal } from "@/components/income/IncomeModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TablePagination } from "@/components/common/TablePagination";
import { useServerPagination } from "@/hooks/useServerPagination";
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
    const [totalCount, setTotalCount] = useState(0);

    const {
        page,
        pageSize,
        sortBy,
        order,
        skip,
        onPageChange,
        onSort
    } = useServerPagination(10, "date");

    const [filters, setFilters] = useState({
        search: "",
        category: "",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);

    // Deletion Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const fetchIncomes = async () => {
        try {
            setLoading(true);
            const paginatedData = await api.getIncomes({
                skip,
                limit: pageSize,
                sort_by: sortBy,
                order,
                category: filters.category || undefined,
            });
            setIncomes(paginatedData.items);
            setTotalCount(paginatedData.total);
        } catch (err: any) {
            setError(err.message || "Failed to load income entries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, [skip, pageSize, sortBy, order, filters.category]);

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        onPageChange(1); // Reset to first page on filter change
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
        setIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        try {
            await api.deleteIncome(idToDelete);
            showToast("Income entry deleted successfully", "success");
            await fetchIncomes();
        } catch (err: any) {
            showToast(err.message || "Delete failed", "error");
        } finally {
            setIsDeleteModalOpen(false);
            setIdToDelete(null);
        }
    };

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0); // Note: This is now per-page
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
                    value={totalCount.toString()}
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
                    <div className="space-y-4">
                        <IncomeTable
                            incomes={incomes}
                            onEdit={(income) => {
                                setEditingIncome(income);
                                setIsModalOpen(true);
                            }}
                            onDelete={handleDelete}
                            onSort={onSort}
                            sortBy={sortBy}
                            order={order}
                        />
                        <TablePagination
                            currentPage={page}
                            totalCount={totalCount}
                            pageSize={pageSize}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </div>

            <IncomeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingIncome}
            />

            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                title="Delete Income?"
                message="Are you sure you want to delete this income entry? This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                }}
            />
        </div>
    );
}
