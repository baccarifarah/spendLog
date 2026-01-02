
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { clsx } from "clsx";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={clsx(
                            "flex animate-fade-in-down items-center gap-3 rounded-lg px-4 py-3 shadow-lg border border-border-theme transition-all bg-background-secondary",
                            toast.type === "success" && "border-l-4 border-l-green-500 text-foreground",
                            toast.type === "error" && "border-l-4 border-l-red-500 text-foreground",
                            toast.type === "info" && "border-l-4 border-l-blue-500 text-foreground"
                        )}
                        role="alert"
                    >
                        {toast.type === "success" && <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />}
                        {toast.type === "error" && <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />}
                        {toast.type === "info" && <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />}

                        <span className="text-sm font-medium">{toast.message}</span>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 rounded-full p-1 hover:bg-black/5"
                        >
                            <X className="h-4 w-4 opacity-60" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
