"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Hide sidebar/header on login page and auth callback routes
    const isAuthPage = pathname === "/login" || pathname?.startsWith("/auth/");

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
