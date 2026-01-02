
import { notFound } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Item {
    id?: number;
    name: string;
    price: number;
    quantity: number;
    receipt_id?: number;
}

export interface Receipt {
    id: number;
    merchant_name: string;
    date: string;
    total_amount: number;
    currency: string;
    category: string;
    location?: string;
    image_url?: string;
    created_at: string;
    items: Item[];
}

export type IncomeCategory = "Salary" | "Freelance" | "Business" | "Investment" | "Other";

export interface Income {
    id: number;
    source: string;
    amount: number;
    currency: string;
    category: IncomeCategory;
    date: string;
    description?: string;
    created_at: string;
}

export interface IncomeCreate {
    source: string;
    amount: number;
    currency?: string;
    category: IncomeCategory;
    date: string;
    description?: string;
}

export interface ReceiptCreate {
    merchant_name: string;
    date: string; // YYYY-MM-DD
    total_amount: number;
    currency?: string;
    category?: string;
    location?: string;
    image_url?: string;
    items?: Item[];
}

export interface ReceiptUpdate {
    merchant_name?: string;
    date?: string;
    total_amount?: number;
    currency?: string;
    category?: string;
    location?: string;
    image_url?: string;
    items?: Item[];
}

export interface DashboardStats {
    total_receipts: number;
    this_month: number;
    total_spent: number;
    total_income: number;
    avg_receipt: number;
    most_expensive: number;
    receipts_per_week: number;
}

export interface MerchantStat {
    merchant_name: string;
    amount: number;
    percentage: number;
    count: number;
    [key: string]: any;
}

export interface CategoryStat {
    category: string;
    amount: number;
    percentage: number;
    count: number;
    [key: string]: any;
}

export interface DashboardData {
    stats: DashboardStats;
    top_merchants: MerchantStat[];
    spending_by_category: CategoryStat[];
    top_income_sources: MerchantStat[];
    income_by_category: CategoryStat[];
}

export interface Settings {
    id: number;
    currency: string;
}

export interface SettingsUpdate {
    currency?: string;
}

import { createClient } from "@/lib/supabase/client";

let globalAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    globalAccessToken = token;
};

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string>),
    };

    if (globalAccessToken) {
        headers["Authorization"] = `Bearer ${globalAccessToken}`;
    } else {
        // Fallback to getting session if no global token set (e.g. initial load or server components)
        // But in client components, we should rely on setAccessToken being called by AuthContext
        console.log(`[API] Getting session fallback for ${endpoint}...`);
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
        } else {
            console.warn("No active session found for API request to:", endpoint);
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
        console.log(`[API] Sending request to ${API_BASE_URL}${endpoint}`);
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        console.log(`[API] Response received from ${endpoint}: ${res.status}`);

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error("Not found");
            }

            if (res.status === 401) {
                // Handle unauthorized
                console.error("Unauthorized request to:", endpoint);
                throw new Error("Unauthorized");
            }

            let errorDetail = "An error occurred";
            try {
                const errorData = await res.json();
                errorDetail = errorData.detail || errorDetail;
            } catch (e) {
                // If JSON parsing fails
            }
            throw new Error(errorDetail);
        }

        if (res.status === 204) {
            return null as any;
        }

        const text = await res.text();
        return text ? JSON.parse(text) : (null as any);
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error(`[API] Request timeout for ${endpoint}`);
            throw new Error('Request timeout');
        }
        throw error;
    }
}

export const api = {
    getReceipts: async (params?: {
        skip?: number;
        limit?: number;
        category?: string;
        merchant_name?: string;
    }): Promise<Receipt[]> => {
        const searchParams = new URLSearchParams();
        if (params) {
            if (params.skip !== undefined) searchParams.append("skip", params.skip.toString());
            if (params.limit !== undefined) searchParams.append("limit", params.limit.toString());
            if (params.category) searchParams.append("category", params.category);
            if (params.merchant_name) searchParams.append("merchant_name", params.merchant_name);
        }
        return fetchAPI<Receipt[]>(`/receipts?${searchParams.toString()}`);
    },

    getReceipt: async (id: number): Promise<Receipt> => {
        return fetchAPI<Receipt>(`/receipts/${id}`);
    },

    createReceipt: async (data: ReceiptCreate): Promise<Receipt> => {
        return fetchAPI<Receipt>("/receipts", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    updateReceipt: async (id: number, data: ReceiptUpdate): Promise<Receipt> => {
        return fetchAPI<Receipt>(`/receipts/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    deleteReceipt: async (id: number): Promise<void> => {
        return fetchAPI<void>(`/receipts/${id}`, {
            method: "DELETE",
        });
    },

    getDashboardStats: async (startDate?: string, endDate?: string): Promise<DashboardData> => {
        let url = "/receipts/dashboard/stats";
        const params = new URLSearchParams();
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        return fetchAPI<DashboardData>(url);
    },

    uploadFile: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_BASE_URL}/receipts/upload`, {
            method: "POST",
            body: formData,
            // Don't set Content-Type header, fetch will set it correctly with boundary
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || "Failed to upload file");
        }

        return res.json();
    },

    deleteFile: async (url: string): Promise<void> => {
        // Extract filename from URL (e.g. /uploads/uuid.jpg)
        const filename = url.split("/").pop();
        if (!filename) throw new Error("Invalid file URL");

        const res = await fetch(`${API_BASE_URL}/receipts/upload/${filename}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || "Failed to delete file");
        }
    },

    // Income
    getIncomes: async (params?: {
        skip?: number;
        limit?: number;
        category?: string;
    }): Promise<Income[]> => {
        const searchParams = new URLSearchParams();
        if (params) {
            if (params.skip !== undefined) searchParams.append("skip", params.skip.toString());
            if (params.limit !== undefined) searchParams.append("limit", params.limit.toString());
            if (params.category) searchParams.append("category", params.category);
        }
        return fetchAPI<Income[]>(`/income?${searchParams.toString()}`);
    },

    createIncome: async (income: IncomeCreate): Promise<Income> => {
        return fetchAPI<Income>("/income", {
            method: "POST",
            body: JSON.stringify(income),
        });
    },

    updateIncome: async (id: number, income: Partial<IncomeCreate>): Promise<Income> => {
        return fetchAPI<Income>(`/income/${id}`, {
            method: "PATCH",
            body: JSON.stringify(income),
        });
    },

    deleteIncome: async (id: number): Promise<void> => {
        await fetchAPI(`/income/${id}`, {
            method: "DELETE",
        });
    },

    // Settings
    getSettings: async (): Promise<Settings> => {
        return fetchAPI<Settings>("/settings");
    },

    updateSettings: async (settings: SettingsUpdate): Promise<Settings> => {
        return fetchAPI<Settings>("/settings", {
            method: "PATCH",
            body: JSON.stringify(settings),
        });
    },

    // Users
    createOrSyncUser: async (data: { id: string; email: string; full_name?: string; avatar_url?: string }): Promise<{ id: string; email: string; full_name?: string; avatar_url?: string }> => {
        return fetchAPI<{ id: string; email: string; full_name?: string; avatar_url?: string }>("/users/", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    getUser: async (id: string): Promise<{ id: string; email: string; full_name?: string; avatar_url?: string }> => {
        return fetchAPI<{ id: string; email: string; full_name?: string; avatar_url?: string }>(`/users/${id}`);
    },

    updateUser: async (id: string, data: { full_name?: string; avatar_url?: string }): Promise<{ id: string; email: string; full_name?: string; avatar_url?: string }> => {
        return fetchAPI<{ id: string; email: string; full_name?: string; avatar_url?: string }>(`/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    deleteUser: async (id: string): Promise<void> => {
        return fetchAPI<void>(`/users/${id}`, {
            method: "DELETE",
        });
    },
};
