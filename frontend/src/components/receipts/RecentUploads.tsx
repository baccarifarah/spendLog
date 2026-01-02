
import Link from "next/link";
import { Clock, FileText, ChevronRight } from "lucide-react";
import { Receipt } from "@/lib/api";
import { clsx } from "clsx";
import { useCurrency } from "@/context/CurrencyContext";

interface RecentUploadsProps {
    receipts: Receipt[];
}

export function RecentUploads({ receipts }: RecentUploadsProps) {
    const { formatAmount } = useCurrency();
    // Helper to format date to "X days ago" 
    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "1 day ago";
        return `${diffInDays} days ago`;
    };

    return (
        <div className="rounded-2xl border border-border-theme bg-background-secondary shadow-sm transition-colors overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border-theme">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Recent Uploads</h3>
                        <p className="text-xs text-gray-500">Your latest 5 receipts uploads</p>
                    </div>
                </div>
                <Link
                    href="/receipts"
                    className="rounded-lg border border-border-theme px-3 py-1.5 text-xs font-medium text-foreground hover:bg-background-hover transition-colors"
                >
                    View All
                </Link>
            </div>

            <div className="divide-y divide-border-theme">
                {receipts.length > 0 ? (
                    receipts.map((receipt) => (
                        <Link
                            key={receipt.id}
                            href={`/receipts/${receipt.id}`}
                            className="flex items-center justify-between p-4 hover:bg-background-hover transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-foreground">
                                            Receipt - {receipt.merchant_name} - {receipt.date} - {formatAmount(receipt.total_amount)}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                        0 Bytes • {getTimeAgo(receipt.created_at || receipt.date)}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </Link>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No recent uploads found.
                    </div>
                )}
            </div>
        </div >
    );
}
