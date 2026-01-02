
"use client";

import { Receipt } from "@/lib/api";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useCurrency } from "@/context/CurrencyContext";

interface ReceiptsTableProps {
    receipts: Receipt[];
    onEdit: (receipt: Receipt) => void;
    onDelete: (id: number) => void;
}

export function ReceiptsTable({ receipts, onEdit, onDelete }: ReceiptsTableProps) {
    const router = useRouter();
    const { formatAmount } = useCurrency();

    return (
        <div className="overflow-hidden rounded-xl border border-border-theme bg-background-secondary shadow-sm transition-colors">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-theme">
                    <thead className="bg-background">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Merchant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-background-secondary divide-y divide-border-theme">
                        {receipts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No receipts found.
                                </td>
                            </tr>
                        ) : (
                            receipts.map((receipt) => (
                                <tr
                                    key={receipt.id}
                                    className="hover:bg-background-hover cursor-pointer transition-colors"
                                    onClick={() => router.push(`/receipts/${receipt.id}`)}
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-foreground">{receipt.merchant_name}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-500">{receipt.date}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                            {receipt.category}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-foreground">
                                            {formatAmount(receipt.total_amount)}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(receipt);
                                                }}
                                                className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(receipt.id);
                                                }}
                                                className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 cursor-pointer"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
