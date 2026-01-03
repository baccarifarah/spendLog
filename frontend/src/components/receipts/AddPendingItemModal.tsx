"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AddPendingItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, quantity: number) => Promise<void>;
}

export function AddPendingItemModal({ isOpen, onClose, onSubmit }: AddPendingItemModalProps) {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        try {
            await onSubmit(name, quantity);
            setName("");
            setQuantity(1);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-background-secondary border border-border-theme shadow-2xl p-6 transition-colors">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Add Item to Buy</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-background-hover transition-colors cursor-pointer">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Item Name</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
                            placeholder="Item Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            required
                            className="block w-full rounded-lg border border-border-theme bg-background p-2.5 text-sm text-foreground focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-foreground bg-background border border-border-theme rounded-lg hover:bg-background-hover transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-all font-semibold cursor-pointer"
                        >
                            {loading ? "Adding..." : "Add to List"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
