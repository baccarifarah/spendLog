"use client";

import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Header() {
    return (
        <header className="flex h-16 items-center justify-end border-b border-border-theme bg-background-secondary px-8 transition-colors">
            <div className="flex items-center gap-4">
                <ThemeToggle />
            </div>
        </header>
    );
}
