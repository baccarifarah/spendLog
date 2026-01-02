"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    TooltipProps,
} from "recharts";
import { DashboardData } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";

interface DashboardChartsProps {
    data: DashboardData | null;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const CurrencyTooltip = ({ active, payload, label }: any) => {
    const { formatAmount } = useCurrency();
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border-theme bg-background-secondary p-2 shadow-sm transition-colors text-foreground">
                <p className="text-sm font-medium">{`${label || payload[0].name} : ${formatAmount(payload[0].value as number)}`}</p>
            </div>
        );
    }
    return null;
};

export function DashboardCharts({ data }: DashboardChartsProps) {
    if (!data) return null;

    const hasSpendingData = data.spending_by_category && data.spending_by_category.length > 0;
    const hasIncomeData = data.income_by_category && data.income_by_category.length > 0;
    const hasMerchantData = data.top_merchants && data.top_merchants.length > 0;
    const hasIncomeSourceData = data.top_income_sources && data.top_income_sources.length > 0;

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Spending by Category */}
            <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                <h3 className="mb-6 text-lg font-bold text-foreground">Spending by Category</h3>
                <div className="h-80 w-full flex items-center justify-center">
                    {hasSpendingData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.spending_by_category}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="amount"
                                    nameKey="category"
                                    label={({ name, percent }: any) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {data.spending_by_category.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={<CurrencyTooltip />}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-500 text-sm italic">No expense data available</div>
                    )}
                </div>
            </div>

            {/* Income by Category */}
            <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                <h3 className="mb-6 text-lg font-bold text-foreground">Income by Category</h3>
                <div className="h-80 w-full flex items-center justify-center">
                    {hasIncomeData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.income_by_category}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#10B981"
                                    dataKey="amount"
                                    nameKey="category"
                                    label={({ name, percent }: any) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {data.income_by_category.map((entry, index) => (
                                        <Cell key={`cell-income-${index}`} fill={COLORS[(index + 2) % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={<CurrencyTooltip />}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-500 text-sm italic">No income data available</div>
                    )}
                </div>
            </div>

            {/* Top Merchants */}
            <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                <h3 className="mb-6 text-lg font-bold text-foreground">Top Merchants</h3>
                <div className="h-80 w-full flex items-center justify-center">
                    {hasMerchantData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.top_merchants}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" className="opacity-20" />
                                <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="merchant_name" type="category" width={100} stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    content={<CurrencyTooltip />}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Legend />
                                <Bar dataKey="amount" fill="#3b82f6" name="Total Spent" barSize={20} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-500 text-sm italic">No transaction data available</div>
                    )}
                </div>
            </div>

            {/* Top Income Sources */}
            <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                <h3 className="mb-6 text-lg font-bold text-foreground">Top Income Sources</h3>
                <div className="h-80 w-full flex items-center justify-center">
                    {hasIncomeSourceData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.top_income_sources}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" className="opacity-20" />
                                <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="merchant_name" type="category" width={100} stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    content={<CurrencyTooltip />}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Legend />
                                <Bar dataKey="amount" fill="#10B981" name="Total Earned" barSize={20} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-500 text-sm italic">No transaction data available</div>
                    )}
                </div>
            </div>
        </div>
    );
}
