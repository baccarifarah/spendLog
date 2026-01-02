
import { DashboardData } from "@/lib/api";
import { Store, PieChart } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface SummaryChartsProps {
    data: DashboardData | null;
}

const CATEGORY_COLORS: Record<string, string> = {
    "Food": "bg-blue-500",
    "Transportation": "bg-green-500",
    "Shopping": "bg-purple-500",
    "Entertainment": "bg-orange-500",
    "Health": "bg-red-500",
    "Housing": "bg-indigo-500",
    "Travel": "bg-teal-500",
    "Work": "bg-slate-500",
    "Bills": "bg-yellow-500",
    "Fitness": "bg-pink-500",
    "Uncategorized": "bg-blue-600",
};

export function SummaryCharts({ data }: SummaryChartsProps) {
    const { formatAmount } = useCurrency();
    if (!data) return null;

    const totalSpent = data.stats.total_spent || 1;

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Merchants Card */}
            <div className="rounded-xl border border-border-theme bg-background-secondary p-5 shadow-sm transition-colors">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <Store className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Top Merchants</h3>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 uppercase tracking-wider">
                        Spendings
                    </span>
                </div>

                <div className="space-y-4">
                    {data.top_merchants.slice(0, 3).map((merchant, index) => {
                        const percentage = ((merchant.amount / totalSpent) * 100).toFixed(1);
                        return (
                            <div key={merchant.merchant_name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground capitalize">{merchant.merchant_name}</p>
                                        <p className="text-[10px] text-gray-500">
                                            1 receipts • {formatAmount(merchant.amount)} avg
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-foreground">{formatAmount(merchant.amount)}</p>
                                    <p className="text-[10px] text-gray-400">{percentage}%</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Spending by Category Card */}
            <div className="rounded-xl border border-border-theme bg-background-secondary p-5 shadow-sm transition-colors">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-orange-50 p-1.5 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                            <PieChart className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Spending by Category</h3>
                    </div>
                    <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 uppercase tracking-wider">
                        Spendings
                    </span>
                </div>

                <div className="space-y-4">
                    {data.spending_by_category.slice(0, 3).map((cat) => {
                        const percentage = ((cat.amount / totalSpent) * 100).toFixed(1);
                        return (
                            <div key={cat.category} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2.5 w-2.5 rounded-full ${CATEGORY_COLORS[cat.category] || "bg-gray-400"}`} />
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{cat.category}</p>
                                        <p className="text-[10px] text-gray-500">
                                            {Math.ceil(cat.amount / 20)} transactions
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-foreground">{formatAmount(cat.amount)}</p>
                                    <p className="text-[10px] text-gray-400">{percentage}%</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
