import { ReactNode } from "react";
import { clsx } from "clsx";
import { useCurrency } from "@/context/CurrencyContext";

interface MiniStatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    className?: string;
    isCurrency?: boolean;
}

export function MiniStatsCard({ title, value, icon, className, isCurrency = true }: MiniStatsCardProps) {
    const { formatAmount } = useCurrency();
    const displayValue = (typeof value === "number" && isCurrency)
        ? formatAmount(value)
        : (typeof value === "number" ? Math.round(value) : value);
    return (
        <div className={clsx(
            "flex items-center gap-2 rounded-full border border-border-theme bg-background-secondary px-4 py-2 shadow-sm transition-colors",
            className
        )}>
            <div className="flex h-5 w-5 items-center justify-center">
                {icon}
            </div>
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-xs font-medium text-gray-500">{title}:</span>
                <span className="text-sm font-bold text-foreground">{displayValue}</span>
            </div>
        </div>
    );
}
