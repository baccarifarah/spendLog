
"use client";

import { Income } from "@/lib/api";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useCurrency } from "@/context/CurrencyContext";

interface IncomeTableProps {
    incomes: Income[];
    onEdit: (income: Income) => void;
    onDelete: (id: number) => void;
}

export function IncomeTable({ incomes, onEdit, onDelete }: IncomeTableProps) {
    const router = useRouter();
    const { formatAmount } = useCurrency();

    return (
        <div className="overflow-hidden rounded-xl border border-border-theme bg-background-secondary shadow-sm transition-colors">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-theme">
                    <thead className="bg-background">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Source
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
                        {incomes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No income entries found.
                                </td>
                            </tr>
                        ) : (
                            incomes.map((income) => (
                                <tr
                                    key={income.id}
                                    className="hover:bg-background-hover transition-colors"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-foreground">{income.source}</div>
                                        {income.description && (
                                            <div className="text-xs text-gray-500 mt-0.5">{income.description}</div>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-500">{income.date}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            {income.category}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                            + {formatAmount(income.amount)}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(income);
                                                }}
                                                className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(income.id);
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
