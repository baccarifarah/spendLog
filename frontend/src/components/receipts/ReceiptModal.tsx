
"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Receipt, ReceiptCreate, ReceiptUpdate, Item } from "@/lib/api";
import { ImageUpload } from "./ImageUpload";
import { useCurrency } from "@/context/CurrencyContext";

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ReceiptCreate | ReceiptUpdate) => Promise<void>;
    initialData?: Receipt | null;
    pendingItem?: Item | null;
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
];

export function ReceiptModal({ isOpen, onClose, onSubmit, initialData, pendingItem }: ReceiptModalProps) {
    const [formData, setFormData] = useState<ReceiptCreate>(() => {
        if (initialData) {
            return {
                merchant_name: initialData.merchant_name,
                date: initialData.date,
                total_amount: initialData.total_amount,
                category: initialData.category,
                currency: initialData.currency,
                location: initialData.location || "",
                image_url: initialData.image_url || "",
                items: initialData.items ? initialData.items.map((i) => ({ ...i })) : [],
            };
        } else if (pendingItem) {
            return {
                merchant_name: "",
                date: new Date().toISOString().split("T")[0],
                total_amount: 0,
                category: "Uncategorized",
                currency: "DT",
                location: "",
                image_url: "",
                items: [{
                    name: pendingItem.name,
                    quantity: pendingItem.quantity,
                    price: 0
                }],
            };
        }
        return {
            merchant_name: "",
            date: new Date().toISOString().split("T")[0],
            total_amount: 0,
            category: "Uncategorized",
            currency: "DT",
            location: "",
            image_url: "",
            items: [],
        };
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                merchant_name: initialData.merchant_name,
                date: initialData.date,
                total_amount: initialData.total_amount,
                category: initialData.category,
                currency: initialData.currency,
                location: initialData.location || "",
                image_url: initialData.image_url || "",
                items: initialData.items.map((i) => ({ ...i })), // Deep copy items
            });
        } else if (pendingItem) {
            setFormData({
                merchant_name: "",
                date: new Date().toISOString().split("T")[0],
                total_amount: 0,
                category: "Uncategorized",
                currency: "DT",
                location: "",
                image_url: "",
                items: [{
                    name: pendingItem.name,
                    quantity: pendingItem.quantity,
                    price: 0
                }],
            });
        } else {
            setFormData({
                merchant_name: "",
                date: new Date().toISOString().split("T")[0],
                total_amount: 0,
                category: "Uncategorized",
                currency: "DT",
                location: "",
                image_url: "",
                items: [],
            });
        }
    }, [initialData, pendingItem, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save receipt");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (items: any[]) => {
        return items.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + price * quantity;
        }, 0);
    };

    const addItem = () => {
        setFormData((prev) => {
            const newItems = [...(prev.items || []), { name: "", price: 0, quantity: 1 }];
            return {
                ...prev,
                items: newItems,
                total_amount: calculateTotal(newItems)
            };
        });
    };

    const removeItem = (index: number) => {
        setFormData((prev) => {
            const newItems = prev.items?.filter((_, i) => i !== index) || [];
            return {
                ...prev,
                items: newItems,
                total_amount: calculateTotal(newItems)
            };
        });
    };

    const updateItem = (index: number, field: keyof Item, value: any) => {
        setFormData((prev) => {
            const newItems = prev.items?.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ) || [];

            const updatedData = {
                ...prev,
                items: newItems,
            };

            // Auto-calculate total if price or quantity changed
            if (field === 'price' || field === 'quantity') {
                updatedData.total_amount = calculateTotal(newItems);
            }

            return updatedData;
        });
    };

    const { symbol } = useCurrency();
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={handleBackdropClick}
        >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-background-secondary border border-border-theme shadow-2xl transition-colors">
                <div className="flex items-center justify-between border-b border-border-theme px-6 py-4">
                    <h2 className="text-xl font-bold text-foreground">
                        {initialData ? "Edit Receipt" : "New Receipt"}
                    </h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-background-hover transition-colors cursor-pointer">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <form id="receipt-form" onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Merchant Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors dark:placeholder-gray-400"
                                    value={formData.merchant_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, merchant_name: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">
                                Location <span className="text-xs font-normal text-gray-500">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors dark:placeholder-gray-400"
                                placeholder="Store address or city"
                                value={formData.location || ""}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <ImageUpload
                            initialUrl={formData.image_url}
                            onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                            onRemove={() => setFormData({ ...formData, image_url: "" })}
                        />

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Total Amount ({symbol})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                    value={isNaN(formData.total_amount) ? "" : formData.total_amount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, total_amount: parseFloat(e.target.value) })
                                    }
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">
                                    Category
                                </label>
                                <select
                                    className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                >
                                    <option value="Uncategorized">Uncategorized</option>
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-border-theme pt-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-foreground">Items</h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" /> Add Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.items?.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Item name"
                                                className="block w-full rounded-lg border border-border-theme bg-background p-2 text-sm text-foreground transition-colors dark:placeholder-gray-500"
                                                value={item.name}
                                                onChange={(e) => updateItem(index, "name", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                step="0.01"
                                                className="block w-full rounded-lg border border-border-theme bg-background p-2 text-sm text-foreground transition-colors dark:placeholder-gray-500"
                                                value={isNaN(item.price) ? "" : item.price}
                                                onChange={(e) => updateItem(index, "price", parseFloat(e.target.value))}
                                                required
                                            />
                                        </div>
                                        <div className="w-20">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="block w-full rounded-lg border border-border-theme bg-background p-2 text-sm text-foreground transition-colors dark:placeholder-gray-500"
                                                value={isNaN(item.quantity) ? "" : item.quantity}
                                                onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="mt-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="border-t border-border-theme px-6 py-4">
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-border-theme bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-background-hover transition-colors cursor-pointer"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="receipt-form"
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Receipt"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
