import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { clsx } from "clsx";
import { useCurrency } from "@/context/CurrencyContext";

interface FinanceCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: string;
        label: string;
        type: "up" | "down";
    };
    variant?: "success" | "danger" | "neutral";
}

function FinanceCard({ title, value, icon, trend, variant = "neutral" }: FinanceCardProps) {
    const isSuccess = variant === "success";
    const isDanger = variant === "danger";
    const { formatAmount } = useCurrency();

    return (
        <div className="rounded-2xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <div className={clsx(
                    "flex h-8 w-8 items-center justify-center transition-colors",
                    isSuccess ? "text-green-500" : isDanger ? "text-red-500" : "text-blue-500"
                )}>
                    {icon}
                </div>
            </div>

            <div className="mt-4">
                <h3 className={clsx(
                    "text-3xl font-bold transition-colors",
                    isSuccess ? "text-green-600 dark:text-green-500" : isDanger ? "text-red-600 dark:text-red-500" : "text-foreground"
                )}>
                    {typeof value === "number" ? formatAmount(value) : value}
                </h3>

                {trend && (
                    <div className="mt-2 flex items-center gap-2">
                        <div className={clsx(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                            trend.type === "up"
                                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        )}>
                            {trend.type === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {trend.value}
                        </div>
                        <span className="text-xs text-gray-400">{trend.label}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface FinanceOverviewProps {
    income?: number;
    expenses: number;
}

export function FinanceOverview({ income = 0, expenses }: FinanceOverviewProps) {
    const savings = income - expenses;
    const { formatAmount } = useCurrency();

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FinanceCard
                title="Total Income"
                value={income}
                icon={<TrendingUp className="h-5 w-5" />}
                variant="success"
            />
            <FinanceCard
                title="Total Expenses"
                value={expenses}
                icon={<TrendingDown className="h-5 w-5" />}
                variant="danger"
            />
            <FinanceCard
                title="Net Savings"
                value={savings}
                icon={<Target className="h-5 w-5" />}
                variant={savings >= 0 ? "success" : "danger"}
            />
        </div>
    );
}
