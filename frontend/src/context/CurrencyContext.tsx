"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, Settings } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type CurrencyCode = "TND" | "USD" | "EUR";

interface CurrencyContextType {
    currency: CurrencyCode;
    symbol: string;
    setCurrency: (code: CurrencyCode) => Promise<void>;
    formatAmount: (amount: number) => string;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const SYMBOLS: Record<CurrencyCode, string> = {
    TND: "DT",
    USD: "$",
    EUR: "€",
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>("TND");
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        async function fetchSettings() {
            if (authLoading || !user) {
                if (!authLoading && !user) {
                    setLoading(false);
                }
                return;
            }

            try {
                setLoading(true);
                const settings = await api.getSettings();
                setCurrencyState(settings.currency as CurrencyCode);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, [user, authLoading]);

    const setCurrency = async (code: CurrencyCode) => {
        try {
            await api.updateSettings({ currency: code });
            setCurrencyState(code);
        } catch (error) {
            console.error("Failed to update currency:", error);
            throw error;
        }
    };

    const formatAmount = (amount: number) => {
        const symbol = SYMBOLS[currency];
        if (currency === "TND") {
            return `${amount.toFixed(2)} ${symbol}`;
        }
        return `${symbol}${amount.toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                symbol: SYMBOLS[currency],
                setCurrency,
                formatAmount,
                loading,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
}
