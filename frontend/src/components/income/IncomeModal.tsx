
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Income, IncomeCreate, IncomeCategory } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";

interface IncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: IncomeCreate | Partial<IncomeCreate>) => Promise<void>;
    initialData?: Income | null;
}

const CATEGORIES: IncomeCategory[] = [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Other",
];

export function IncomeModal({ isOpen, onClose, onSubmit, initialData }: IncomeModalProps) {
    const [formData, setFormData] = useState<IncomeCreate>(() => {
        if (initialData) {
            return {
                source: initialData.source,
                amount: initialData.amount,
                currency: initialData.currency,
                category: initialData.category,
                date: initialData.date,
                description: initialData.description || "",
            };
        }
        return {
            source: "",
            amount: 0,
            currency: "DT",
            category: "Salary",
            date: new Date().toISOString().split("T")[0],
            description: "",
        };
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                source: initialData.source,
                amount: initialData.amount,
                currency: initialData.currency,
                category: initialData.category,
                date: initialData.date,
                description: initialData.description || "",
            });
        } else {
            setFormData({
                source: "",
                amount: 0,
                currency: "DT",
                category: "Salary",
                date: new Date().toISOString().split("T")[0],
                description: "",
            });
        }
    }, [initialData, isOpen]);

    const { symbol } = useCurrency();
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save income entry");
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity"
            onMouseDown={handleBackdropClick}
        >
            <div className="w-full max-w-lg rounded-2xl bg-background shadow-2xl transition-all dark:border dark:border-border-theme">
                <div className="flex items-center justify-between border-b border-border-theme px-6 py-4">
                    <h2 className="text-xl font-bold text-foreground">
                        {initialData ? "Edit Income Entry" : "Add Income Entry"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-500 hover:bg-background-hover hover:text-gray-700 transition-colors cursor-pointer"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4">
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">Source</label>
                            <input
                                type="text"
                                required
                                className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                placeholder="e.g. Monthly Salary, Project X"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Amount ({symbol})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                    value={isNaN(formData.amount) ? "" : formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Category</label>
                                <select
                                    className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as IncomeCategory })}
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Date</label>
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
                            <label className="mb-2 block text-sm font-medium text-foreground">Description (Optional)</label>
                            <textarea
                                className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                placeholder="Add more details..."
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-border-theme pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-border-theme bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-background-hover transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            {loading ? "Saving..." : initialData ? "Update Entry" : "Save Entry"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
