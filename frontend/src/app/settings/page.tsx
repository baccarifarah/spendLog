"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useTheme } from "next-themes";
import { Coins, Moon, Sun, Monitor, User, Trash2, Save, Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    // Form State
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Global Settings
    const { currency, setCurrency } = useCurrency();
    const { theme, setTheme } = useTheme();

    // Fetch user details on mount
    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || "");
            // Optionally fetch fresh data from backend if needed
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await api.updateUser(user.id, { full_name: fullName });
            showToast("Profile updated successfully", "success");
            // Reload to refresh auth context metadata if possible, or just stay
            window.location.reload();
        } catch (error) {
            console.error(error);
            showToast("Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

        try {
            await api.deleteUser(user.id);
            await signOut();
            router.push("/login");
            showToast("Account deleted successfully", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete account", "error");
        }
    };

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Account</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Information */}
                <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Profile Information</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                Update your account's profile information and email address.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Profile Photo */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-4">Profile Photo</label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden border-2 border-background shadow-sm">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <span>{user.email?.[0].toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <button className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors w-full sm:w-auto justify-center">
                                        <Upload className="h-4 w-4" />
                                        Change Photo
                                    </button>
                                    <button className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors w-full sm:w-auto justify-center">
                                        <X className="h-4 w-4" />
                                        Remove
                                    </button>
                                    <p className="text-xs text-muted-foreground">
                                        Recommended: Square image, at least 200x200px, max 5MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Enter your full name"
                                    />
                                    <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-muted-foreground"
                                    />
                                    <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Email address cannot be changed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regional Settings */}
                <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 transition-colors">
                            <Coins className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Regional Settings</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                Set your preferred currency
                            </p>
                        </div>
                    </div>

                    <div className="max-w-md space-y-2">
                        <label className="text-sm font-medium text-foreground">Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as any)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                            <option value="TND">TND - Tunisian Dinar (DT)</option>
                            <option value="USD">USD - US Dollar ($)</option>
                            <option value="EUR">EUR - Euro (€)</option>
                        </select>
                    </div>
                </div>

                {/* Appearance */}
                <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 transition-colors">
                            <Sun className="h-5 w-5 dark:hidden" />
                            <Moon className="h-5 w-5 hidden dark:block" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Appearance</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">UI Theme Preference</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => setTheme("light")}
                            className={clsx(
                                "flex flex-col items-center gap-3 rounded-lg border p-4 transition-all hover:bg-accent cursor-pointer",
                                theme === "light"
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border-theme bg-background"
                            )}
                        >
                            <Sun className="h-6 w-6 text-orange-500" />
                            <span className="text-sm font-medium">Light Mode</span>
                        </button>

                        <button
                            onClick={() => setTheme("dark")}
                            className={clsx(
                                "flex flex-col items-center gap-3 rounded-lg border p-4 transition-all hover:bg-accent cursor-pointer",
                                theme === "dark"
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border-theme bg-background"
                            )}
                        >
                            <Moon className="h-6 w-6 text-blue-500" />
                            <span className="text-sm font-medium">Dark Mode</span>
                        </button>

                        <button
                            onClick={() => setTheme("system")}
                            className={clsx(
                                "flex flex-col items-center gap-3 rounded-lg border p-4 transition-all hover:bg-accent cursor-pointer",
                                theme === "system"
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border-theme bg-background"
                            )}
                        >
                            <Monitor className="h-6 w-6 text-gray-500" />
                            <span className="text-sm font-medium">System</span>
                        </button>
                    </div>
                </div>

                {/* Delete Account */}
                <div className="rounded-xl border border-border-theme bg-background-secondary p-6 shadow-sm transition-colors">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Delete Account</h2>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete your account and all associated data.
                            </p>
                        </div>
                        <button
                            onClick={handleDeleteAccount}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-red-600 text-white hover:bg-red-700 h-10 py-2 px-4 shadow-sm"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Save Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 font-bold shadow-lg hover:bg-foreground/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Save className="h-5 w-5" />
                    )}
                    Save Changes
                </button>
            </div>
        </div>
    );
}
