
"use client";

import { useEffect, useState } from "react";
import { api, Receipt, ReceiptCreate, ReceiptUpdate, DashboardData } from "@/lib/api";
import { ReceiptsTable } from "@/components/receipts/ReceiptsTable";
import { ReceiptFilters } from "@/components/receipts/ReceiptFilters";
import { ReceiptModal } from "@/components/receipts/ReceiptModal";
import { MiniStatsCard } from "@/components/dashboard/MiniStatsCard";
import { SummaryCharts } from "@/components/dashboard/SummaryCharts";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useToast } from "@/context/ToastContext";
import {
    Receipt as ReceiptIcon,
    Calendar,
    DollarSign,
    TrendingUp,
    AlertCircle,
    BarChart3,
    Plus
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";


export default function ReceiptsPage() {
    const { showToast } = useToast();
    const { formatAmount } = useCurrency();
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [statsData, setStatsData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState({
        search: "",
        category: "",
        merchant: "",
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

    // Deletion Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const [receiptsData, themeStats] = await Promise.all([
                api.getReceipts({
                    limit: 100,
                    category: filters.category || undefined,
                }),
                api.getDashboardStats()
            ]);
            setReceipts(receiptsData);
            setStatsData(themeStats);
        } catch (err: any) {
            setError(err.message || "Failed to load receipts data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, [filters.category]);

    const filteredReceipts = receipts.filter((receipt) => {
        const searchLower = filters.search.toLowerCase();
        return (
            receipt.merchant_name.toLowerCase().includes(searchLower) ||
            receipt.total_amount.toString().includes(searchLower)
        );
    });

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (data: ReceiptCreate | ReceiptUpdate) => {
        try {
            if (editingReceipt) {
                await api.updateReceipt(editingReceipt.id, data as ReceiptUpdate);
                showToast("Receipt updated successfully", "success");
            } else {
                await api.createReceipt(data as ReceiptCreate);
                showToast("Receipt created successfully", "success");
            }
            await fetchReceipts();
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
            await api.deleteReceipt(idToDelete);
            showToast("Receipt deleted successfully", "success");
            await fetchReceipts();
        } catch (err: any) {
            showToast(err.message || "Delete failed", "error");
        } finally {
            setIsDeleteModalOpen(false);
            setIdToDelete(null);
        }
    };

    const openCreateModal = () => {
        setEditingReceipt(null);
        setIsModalOpen(true);
    };

    const openEditModal = (receipt: Receipt) => {
        setEditingReceipt(receipt);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Receipt Manager</h1>
                    <p className="text-gray-500">View and manage your receipts.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
                >
                    <Plus className="h-5 w-5" />
                    Add Manually
                </button>
            </div>



            {statsData && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <MiniStatsCard
                        title="Total Receipts"
                        value={statsData.stats.total_receipts}
                        isCurrency={false}
                        icon={<ReceiptIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                    />
                    <MiniStatsCard
                        title="This Month"
                        value={statsData.stats.this_month}
                        isCurrency={false}
                        icon={<Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                    />
                    <MiniStatsCard
                        title="Total Spent"
                        value={statsData.stats.total_spent}
                        icon={<DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                    />
                    <MiniStatsCard
                        title="Most Expensive"
                        value={statsData.stats.most_expensive}
                        icon={<TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                    />
                </div>
            )}

            <SummaryCharts data={statsData} />

            <div className="flex flex-col gap-4 border-t border-border-theme pt-8">
                <ReceiptFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
                    Loading receipts...
                </div>
            ) : error ? (
                <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">Error: {error}</div>
            ) : (
                <ReceiptsTable
                    receipts={filteredReceipts}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                />
            )}

            <ReceiptModal
                key={editingReceipt ? editingReceipt.id : "create"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingReceipt}
            />

            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                title="Delete Receipt?"
                message="Are you sure you want to delete this receipt? This action cannot be undone."
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
