import { ReactNode } from "react";
import { clsx } from "clsx";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    change?: string;
    trend?: "up" | "down" | "neutral";
    className?: string;
}

export function StatsCard({ title, value, icon, change, trend, className }: StatsCardProps) {
    return (
        <div className={clsx("rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors", className)}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 transition-colors">
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                {change && (
                    <span
                        className={clsx(
                            "text-sm font-medium",
                            trend === "up" ? "text-green-600 dark:text-green-400" : trend === "down" ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                        )}
                    >
                        {change}
                    </span>
                )}
            </div>
        </div>
    );
}
