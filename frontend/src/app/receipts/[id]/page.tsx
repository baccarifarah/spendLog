"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Calendar, MapPin, CreditCard, Tag, FileText, Image as ImageIcon, Pencil, Loader2 } from "lucide-react";
import { api, Receipt, ReceiptUpdate, Item } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function ReceiptDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newItem, setNewItem] = useState<Partial<Item>>({ name: "", price: 0, quantity: 1 });
    const [actionLoading, setActionLoading] = useState(false);

    const id = Number(params.id);

    const fetchReceipt = async () => {
        try {
            setLoading(true);
            const data = await api.getReceipt(id);
            setReceipt(data);
        } catch (err: any) {
            setError(err.message || "Failed to load receipt");
            showToast("Failed to load receipt", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isNaN(id)) {
            fetchReceipt();
        }
    }, [id]);

    const calculateTotal = (items: Item[]) => {
        return items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    };

    const updateReceiptItems = async (updatedItems: Item[]) => {
        if (!receipt) return;
        setActionLoading(true);
        try {
            const newTotal = calculateTotal(updatedItems);
            const updateData: ReceiptUpdate = {
                items: updatedItems,
                total_amount: newTotal
            };
            const updatedReceipt = await api.updateReceipt(receipt.id, updateData);
            setReceipt(updatedReceipt);
            showToast("Receipt updated successfully", "success");
        } catch (err: any) {
            showToast(err.message || "Failed to update receipt", "error");
            // Revert state if needed? For now we just reload or keep stale
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveImage = async () => {
        if (!receipt || !receipt.image_url) return;

        setActionLoading(true);
        try {
            const oldUrl = receipt.image_url;
            await api.updateReceipt(receipt.id, { image_url: "" });

            try {
                await api.deleteFile(oldUrl);
            } catch (e) {
                console.error("Physical file deletion failed:", e);
            }

            await fetchReceipt();
            showToast("Image removed successfully", "success");
        } catch (err: any) {
            showToast(err.message || "Failed to remove image", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !receipt) return;

        setActionLoading(true);
        try {
            const oldUrl = receipt.image_url;
            const uploadResult = await api.uploadFile(file);
            await api.updateReceipt(receipt.id, { image_url: uploadResult.url });

            if (oldUrl) {
                try {
                    await api.deleteFile(oldUrl);
                } catch (e) {
                    console.warn("Old file deletion failed:", e);
                }
            }

            await fetchReceipt();
            showToast("Image updated successfully", "success");
        } catch (err: any) {
            showToast(err.message || "Failed to update image", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.name || newItem.price === undefined || newItem.quantity === undefined || !receipt) return;

        const updatedItems = [...(receipt.items || []), newItem as Item];
        await updateReceiptItems(updatedItems);
        setNewItem({ name: "", price: 0, quantity: 1 });
    };

    const handleDeleteItem = async (index: number) => {
        if (!receipt || !receipt.items) return;
        const updatedItems = receipt.items.filter((_, i) => i !== index);
        await updateReceiptItems(updatedItems);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading receipt details...</div>;
    if (error || !receipt) return <div className="p-8 text-center text-red-500">Error: {error || "Receipt not found"}</div>;

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-background-hover hover:text-gray-900 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Receipt Details</h1>
                    <p className="text-sm text-gray-500">View and manage items for this receipt</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 transition-colors">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Merchant</span>
                    </div>
                    <p className="mt-4 text-xl font-bold text-foreground">{receipt.merchant_name}</p>
                </div>

                <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-900/40 dark:text-green-400 transition-colors">
                            <Tag className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Total Amount</span>
                    </div>
                    <p className="mt-4 text-xl font-bold text-blue-600 dark:text-blue-400">
                        {receipt.total_amount.toFixed(2)} DT
                    </p>
                </div>

                <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 transition-colors">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Date</span>
                    </div>
                    <p className="mt-4 text-xl font-bold text-foreground">{receipt.date}</p>
                </div>

                <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="rounded-lg bg-orange-50 p-2 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 transition-colors">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Location</span>
                    </div>
                    <p className="mt-4 text-xl font-bold text-foreground">{receipt.location || "N/A"}</p>
                </div>
            </div>

            {/* Image Attachment Section */}
            {(receipt.image_url || actionLoading) && (
                <div className="group relative rounded-xl border border-border-theme bg-background-secondary shadow-sm transition-all overflow-hidden">
                    <div className="border-b border-border-theme px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground">Attached Receipt</h2>
                        <div className="flex gap-2">
                            <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/60 transition-colors">
                                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleEditImage} disabled={actionLoading} />
                                <Pencil className="h-4 w-4" />
                            </label>
                            <button
                                onClick={handleRemoveImage}
                                disabled={actionLoading}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        {actionLoading ? (
                            <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border-theme bg-background/50">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                                <p className="text-base font-medium text-gray-500">Updating attachment...</p>
                            </div>
                        ) : receipt.image_url && (
                            <>
                                {receipt.image_url.toLowerCase().endsWith(".pdf") ? (
                                    <div className="flex items-center gap-6 rounded-xl border border-border-theme bg-background p-8">
                                        <div className="rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                            <FileText className="h-12 w-12" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-foreground mb-1">Receipt PDF Document</h3>
                                            <p className="text-sm text-gray-500 mb-4">The receipt is stored as a secure PDF document.</p>
                                            <a
                                                href={receipt.image_url.startsWith("http") ? receipt.image_url : `http://localhost:8000${receipt.image_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                                            >
                                                View Document
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-center rounded-xl border border-border-theme bg-background p-4 shadow-inner">
                                        <img
                                            src={receipt.image_url.startsWith("http") ? receipt.image_url : `http://localhost:8000${receipt.image_url}`}
                                            alt="Receipt attachment"
                                            className="max-h-[600px] w-full object-contain rounded-lg"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Items Section */}
            <div className="rounded-xl border border-border-theme bg-background-secondary shadow-sm transition-colors">
                <div className="border-b border-border-theme px-6 py-4">
                    <h2 className="text-lg font-bold text-foreground">Receipt Items</h2>
                </div>

                <div className="p-6">
                    <div className="mb-6 overflow-hidden rounded-lg border border-border-theme transition-colors">
                        <table className="min-w-full divide-y divide-border-theme">
                            <thead className="bg-background">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Item Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-theme bg-background-secondary">
                                {receipt.items && receipt.items.length > 0 ? (
                                    receipt.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-background-hover transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{item.name}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.quantity}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.price.toFixed(2)}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-foreground">
                                                {(item.quantity * item.price).toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <button
                                                    onClick={() => handleDeleteItem(index)}
                                                    disabled={actionLoading}
                                                    className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
                                                    title="Delete Item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No items added yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Add Item Form */}
                    <div className="flex flex-col gap-4 rounded-lg bg-background border border-border-theme p-4 md:flex-row md:items-end transition-colors">
                        <div className="flex-1">
                            <label className="mb-1 block text-sm font-medium text-foreground">Item Name</label>
                            <input
                                type="text"
                                placeholder="Enter item name"
                                className="block w-full rounded-lg border border-border-theme bg-background-secondary p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors dark:placeholder-gray-400"
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            />
                        </div>
                        <div className="w-32">
                            <label className="mb-1 block text-sm font-medium text-foreground">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                className="block w-full rounded-lg border border-border-theme bg-background-secondary p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="w-32">
                            <label className="mb-1 block text-sm font-medium text-foreground">Price (DT)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="block w-full rounded-lg border border-border-theme bg-background-secondary p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                value={newItem.price}
                                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <button
                            onClick={handleAddItem}
                            disabled={actionLoading || !newItem.name || newItem.price! < 0 || newItem.quantity! <= 0}
                            className="flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-800 transition-colors cursor-pointer"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
