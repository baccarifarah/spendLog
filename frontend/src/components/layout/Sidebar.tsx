"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Receipt, PieChart, Wallet, Settings, LogOut, ChevronLeft, ChevronRight, Coins } from "lucide-react";
import { clsx } from "clsx";
import { useCurrency } from "@/context/CurrencyContext";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Receipt Manager", href: "/receipts", icon: Receipt },
    { name: "Income entries", href: "/income", icon: Wallet },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { currency, setCurrency } = useCurrency();

    return (
        <div className={clsx(
            "flex h-screen flex-col justify-between border-r border-border-theme bg-background-secondary p-4 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-20" : "w-64"
        )}>
            <div>
                <div className={clsx(
                    "mb-8 flex items-center justify-between px-2",
                    isCollapsed && "flex-col gap-4"
                )}>
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                            <PieChart className="h-5 w-5 text-white" />
                        </div>
                        {!isCollapsed && (
                            <span className="text-xl font-bold text-black dark:text-white transition-opacity duration-300">SpendLog</span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-border-theme bg-background-secondary text-gray-400 hover:text-foreground transition-colors cursor-pointer"
                        title={isCollapsed ? "Expand" : "Collapse"}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </div>

                <nav className="flex-1 space-y-2 px-3 py-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "text-gray-700 hover:bg-background-hover hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
                                    isCollapsed && "justify-center"
                                )}
                                title={isCollapsed ? item.name : ""}
                            >
                                <item.icon className={clsx(
                                    "h-5 w-5 shrink-0",
                                    isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-500 group-hover:text-foreground transition-colors"
                                )} />
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-border-theme pt-4 gap-2 flex flex-col">
                {!isCollapsed && user && (
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 mb-2 px-2 cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors block"
                        title="Manage Account"
                    >
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="User" />
                            ) : (
                                <span>{user?.email?.[0].toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-xs text-muted-foreground" title={user.email}>{user.email}</p>
                        </div>
                    </Link>
                )}

                <button
                    onClick={() => signOut()}
                    className={clsx(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer group",
                        isCollapsed && "justify-center"
                    )}
                    title={isCollapsed ? "Logout" : ""}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}
