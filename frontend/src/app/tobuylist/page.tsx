"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingCart, ArrowRight, Package } from "lucide-react";
import { api, Item, PendingItemCreate } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
import { ReceiptModal } from "@/components/receipts/ReceiptModal";
import { AddPendingItemModal } from "@/components/receipts/AddPendingItemModal";
import { useAuth } from "@/context/AuthContext";
import { MiniStatsCard } from "@/components/dashboard/MiniStatsCard";
import { useToast } from "@/context/ToastContext";

export default function ToBuyListPage() {
    const { showToast } = useToast();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Payment Modal State
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedItemToPay, setSelectedItemToPay] = useState<Item | null>(null);

    const { formatAmount } = useCurrency();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadItems();
        }
    }, [user]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await api.getPendingItems();
            setItems(data);
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
        if (!confirm("Remove this item from your list?")) return;
        try {
            await api.deletePendingItem(id);
            setItems(items.filter(i => i.id !== id));
            showToast("Item removed", "success");
        } catch (error) {
            showToast("Failed to delete item", "error");
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
                    value={items.length}
                    isCurrency={false}
                    icon={<Package className="h-4 w-4 text-blue-500" />}
                />

            </div>

            {/* Table/List */}
            <div className="overflow-hidden rounded-xl border border-border-theme bg-background-secondary shadow-sm transition-colors">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-theme">
                        <thead className="bg-background">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Item Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-theme bg-background-secondary">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">Loading your list...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center bg-background-secondary">
                                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">Your list is empty</p>
                                        <p className="text-sm text-gray-400">Add something you need to buy!</p>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-background-hover transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm font-semibold text-foreground">{item.name}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">x{item.quantity}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                Pending
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handlePayClick(item)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/20 dark:text-emerald-400"
                                                >
                                                    Pay <ArrowRight size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="rounded-lg p-1.5 text-red-600 hover:bg-background-hover transition-colors dark:text-red-400"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
        </div>
    );
}
