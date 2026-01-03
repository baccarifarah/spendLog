"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingCart, ArrowRight, Package } from "lucide-react";
import { api, Item, PendingItemCreate } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
import { ReceiptModal } from "@/components/receipts/ReceiptModal";
import { AddPendingItemModal } from "@/components/receipts/AddPendingItemModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ToBuyTable } from "@/components/receipts/ToBuyTable";
import { TablePagination } from "@/components/common/TablePagination";
import { useServerPagination } from "@/hooks/useServerPagination";
import { useAuth } from "@/context/AuthContext";
import { MiniStatsCard } from "@/components/dashboard/MiniStatsCard";
import { useToast } from "@/context/ToastContext";

export default function ToBuyListPage() {
    const { showToast } = useToast();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const {
        page,
        pageSize,
        sortBy,
        order,
        skip,
        onPageChange,
        onSort
    } = useServerPagination(10, "name");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Deletion Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    // Payment Modal State
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedItemToPay, setSelectedItemToPay] = useState<Item | null>(null);

    const { formatAmount } = useCurrency();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadItems();
        }
    }, [user, skip, pageSize, sortBy, order]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const paginatedData = await api.getPendingItems({
                skip,
                limit: pageSize,
                sort_by: sortBy,
                order
            });
            setItems(paginatedData.items);
            setTotalCount(paginatedData.total);
        } catch (error) {
            console.error("Failed to load to-buy list:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (name: string, quantity: number) => {
        try {
            const newItem: PendingItemCreate = { name, quantity };
            await api.createPendingItem(newItem);
            showToast("Item added to list", "success");
            loadItems();
        } catch (error) {
            showToast("Failed to add item", "error");
        }
    };

    const handleDeleteItem = async (id?: number) => {
        if (!id) return;
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.deletePendingItem(itemToDelete);
            setItems(items.filter(i => i.id !== itemToDelete));
            showToast("Item removed", "success");
        } catch (error) {
            showToast("Failed to delete item", "error");
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handlePayClick = (item: Item) => {
        setSelectedItemToPay(item);
        setIsPayModalOpen(true);
    };

    const handlePaySubmit = async (data: any) => {
        if (!selectedItemToPay) return;

        try {
            const payload = {
                ...data,
                pending_item_ids: [selectedItemToPay.id]
            };
            await api.createReceipt(payload);
            showToast("Item paid and added to receipts", "success");
            loadItems();
            setIsPayModalOpen(false);
            setSelectedItemToPay(null);
        } catch (error: any) {
            showToast(error.message || "Payment failed", "error");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">To Buy List</h1>
                    <p className="text-gray-500">Plan and track items before purchasing.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors shadow-sm cursor-pointer"
                >
                    <Plus className="h-5 w-5" />
                    Add Item
                </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MiniStatsCard
                    title="Items to Buy"
                    value={totalCount}
                    isCurrency={false}
                    icon={<Package className="h-4 w-4 text-blue-500" />}
                />

            </div>

            {/* Table/List */}
            <div className="space-y-4">
                <ToBuyTable
                    items={items}
                    onPay={handlePayClick}
                    onDelete={handleDeleteItem}
                    onSort={onSort}
                    sortBy={sortBy}
                    order={order}
                    loading={loading}
                />
                <TablePagination
                    currentPage={page}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                />
            </div>

            {/* Modals */}
            <AddPendingItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddItem}
            />

            <ReceiptModal
                isOpen={isPayModalOpen}
                onClose={() => {
                    setIsPayModalOpen(false);
                    setSelectedItemToPay(null);
                }}
                onSubmit={handlePaySubmit}
                pendingItem={selectedItemToPay || undefined}
            />

            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                title="Remove Item?"
                message="Are you sure you want to remove this item from your list?"
                confirmLabel="Remove"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
            />
        </div>
    );
}
