"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, FileText, Image as ImageIcon, Pencil, Loader2 } from "lucide-react";
import { Receipt, ReceiptUpdate, Item, api } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";

interface ReceiptDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    receipt: Receipt | null;
    onUpdate: () => void; // refetch list
}

export function ReceiptDetailModal({ isOpen, onClose, receipt, onUpdate }: ReceiptDetailModalProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [newItem, setNewItem] = useState<Partial<Item>>({ name: "", price: 0, quantity: 1 });
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { formatAmount } = useCurrency();

    useEffect(() => {
        if (receipt) {
            setItems(receipt.items ? receipt.items.map(i => ({ ...i })) : []);
        } else {
            setItems([]);
        }
        setNewItem({ name: "", price: 0, quantity: 1 });
        setError(null);
    }, [receipt, isOpen]);

    if (!isOpen || !receipt) return null;

    const calculateTotal = (currentItems: Item[]) => {
        return currentItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    };

    const handleAddItem = async () => {
        if (!newItem.name || newItem.price === undefined || newItem.quantity === undefined) return;

        const updatedItems = [...items, newItem as Item];
        setItems(updatedItems);
        setNewItem({ name: "", price: 0, quantity: 1 }); // Reset form

        // Auto-save or wait for save button? 
        // Let's implement auto-save for "Options to Add Item" as it feels more interactive.
        await saveChanges(updatedItems);
    };

    const handleDeleteItem = async (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
        await saveChanges(updatedItems);
    };

    const saveChanges = async (updatedItems: Item[]) => {
        setLoading(true);
        setError(null);
        try {
            const newTotal = calculateTotal(updatedItems);
            // We only update items and total_amount. 
            // Note: The backend might calculate total automatically? 
            // The prompt says "automatically calculating totals" in previous steps, 
            // but let's send it to be sure or just send items.
            // Looking at api.ts ReceiptUpdate, it allows total_amount.

            const updateData: ReceiptUpdate = {
                items: updatedItems,
                total_amount: newTotal
            };

            await api.updateReceipt(receipt.id, updateData);
            onUpdate(); // Refresh parent list
        } catch (err: any) {
            setError(err.message || "Failed to update receipt");
            // Revert changes or show error? For now show error.
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveImage = async () => {
        if (!receipt || !receipt.image_url) return;

        setActionLoading(true);
        setError(null);
        try {
            const oldUrl = receipt.image_url;
            // Update receipt first
            await api.updateReceipt(receipt.id, { image_url: "" });

            // Try to delete physical file (optional, don't block on failure)
            try {
                await api.deleteFile(oldUrl);
            } catch (e) {
                console.error("Physical file deletion failed:", e);
            }

            onUpdate();
        } catch (err: any) {
            setError(err.message || "Failed to remove image");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !receipt) return;

        setActionLoading(true);
        setError(null);
        try {
            const oldUrl = receipt.image_url;

            // 1. Upload new file
            const uploadResult = await api.uploadFile(file);

            // 2. Update receipt with new URL
            await api.updateReceipt(receipt.id, { image_url: uploadResult.url });

            // 3. Delete old file if it existed
            if (oldUrl) {
                try {
                    await api.deleteFile(oldUrl);
                } catch (e) {
                    console.warn("Old file deletion failed:", e);
                }
            }

            onUpdate();
        } catch (err: any) {
            setError(err.message || "Failed to update image");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-background-secondary border border-border-theme shadow-2xl transition-colors">
                <div className="flex items-center justify-between border-b border-border-theme px-6 py-4">
                    <h2 className="text-xl font-bold text-foreground">Receipt Details</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-background-hover transition-colors cursor-pointer">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* Summary Section */}
                    <div className="mb-8 grid grid-cols-1 gap-6 rounded-lg bg-background p-6 border border-border-theme sm:grid-cols-2 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Merchant</p>
                            <p className="text-lg font-semibold text-foreground">{receipt.merchant_name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Amount</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatAmount(receipt.total_amount)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Date</p>
                            <p className="text-foreground/80">{receipt.date}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Location</p>
                            <p className="text-foreground/80">{receipt.location || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Items</p>
                            <p className="text-foreground/80">{items.length}</p>
                        </div>
                    </div>

                    {/* Image Attachment Section */}
                    {(receipt.image_url || actionLoading) && (
                        <div className="group relative mb-8 rounded-xl border border-border-theme bg-background p-4 transition-all">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Attached Receipt</h3>
                                <div className="flex gap-2">
                                    <label className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
                                        <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleEditImage} disabled={actionLoading} />
                                        <Pencil className="h-4 w-4" />
                                    </label>
                                    <button
                                        onClick={handleRemoveImage}
                                        disabled={actionLoading}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {actionLoading ? (
                                <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-theme bg-background-secondary">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    <p className="text-sm text-gray-500 font-medium">Updating attachment...</p>
                                </div>
                            ) : receipt.image_url && (
                                <>
                                    {receipt.image_url.toLowerCase().endsWith(".pdf") ? (
                                        <div className="flex items-center gap-4 rounded-lg bg-background-secondary p-4">
                                            <div className="rounded-lg bg-red-50 p-2 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                                <FileText className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Receipt PDF Document</p>
                                                <a
                                                    href={receipt.image_url.startsWith("http") ? receipt.image_url : `http://localhost:8000${receipt.image_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                >
                                                    Open in new tab
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="overflow-hidden rounded-lg border border-border-theme bg-gray-50 dark:bg-gray-800 shadow-inner">
                                            <img
                                                src={receipt.image_url.startsWith("http") ? receipt.image_url : `http://localhost:8000${receipt.image_url}`}
                                                alt="Receipt attachment"
                                                className="max-h-[300px] w-full object-contain"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Items Section */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-foreground">Items</h3>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="overflow-hidden rounded-lg border border-border-theme">
                            <table className="min-w-full divide-y divide-border-theme">
                                <thead className="bg-background">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Item</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Qty</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Price</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Total</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 transition-colors">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-theme bg-background-secondary">
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-background-hover transition-colors">
                                            <td className="px-4 py-3 text-sm text-foreground">{item.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{formatAmount(item.price)}</td>
                                            <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                                                {formatAmount(item.quantity * item.price)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                <button
                                                    onClick={() => handleDeleteItem(index)}
                                                    disabled={loading}
                                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No items on this receipt.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Item Form */}
                        <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border-theme bg-background p-4 md:flex-row md:items-end transition-colors">
                            <div className="flex-1">
                                <label className="mb-1 block text-xs font-medium text-foreground">Item Name</label>
                                <input
                                    type="text"
                                    className="block w-full rounded-md border border-border-theme bg-background-secondary p-2 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors dark:placeholder-gray-500"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="e.g. Latte"
                                />
                            </div>
                            <div className="w-24">
                                <label className="mb-1 block text-xs font-medium text-foreground">Qty</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="block w-full rounded-md border border-border-theme bg-background-secondary p-2 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="w-28">
                                <label className="mb-1 block text-xs font-medium text-foreground">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="block w-full rounded-md border border-border-theme bg-background-secondary p-2 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <button
                                onClick={handleAddItem}
                                disabled={loading || !newItem.name || newItem.price! < 0 || newItem.quantity! <= 0}
                                className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-900 md:w-auto transition-colors cursor-pointer"
                            >
                                <Plus className="mr-1 h-4 w-4" /> Add
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border-theme px-6 py-4">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="rounded-lg bg-background border border-border-theme px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-background-hover transition-colors dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
