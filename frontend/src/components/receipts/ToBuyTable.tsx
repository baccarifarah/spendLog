"use client";

import { Item } from "@/lib/api";
import { Trash2, ArrowRight, ArrowUp, ArrowDown, ShoppingCart } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface ToBuyTableProps {
    items: Item[];
    onPay: (item: Item) => void;
    onDelete: (id: number) => void;
    onSort: (column: string) => void;
    sortBy: string;
    order: "asc" | "desc";
    loading?: boolean;
}

export function ToBuyTable({
    items,
    onPay,
    onDelete,
    onSort,
    sortBy,
    order,
    loading
}: ToBuyTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-border-theme bg-background-secondary shadow-sm transition-colors">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-theme">
                    <thead className="bg-background">
                        <tr>
                            <th
                                onClick={() => onSort("name")}
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-background-hover transition-colors"
                            >
                                <div className="flex items-center gap-1">
                                    Item Name
                                    {sortBy === "name" && (
                                        order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                    )}
                                </div>
                            </th>
                            <th
                                onClick={() => onSort("quantity")}
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-background-hover transition-colors"
                            >
                                <div className="flex items-center gap-1">
                                    Quantity
                                    {sortBy === "quantity" && (
                                        order === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                    )}
                                </div>
                            </th>
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
                                                onClick={() => onPay(item)}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/20 dark:text-emerald-400"
                                            >
                                                Pay <ArrowRight size={14} />
                                            </button>
                                            <button
                                                onClick={() => item.id && onDelete(item.id)}
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
    );
}
