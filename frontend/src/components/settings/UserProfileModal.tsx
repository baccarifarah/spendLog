"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFullName?: string;
    userId: string;
}

export function UserProfileModal({ isOpen, onClose, currentFullName, userId }: UserProfileModalProps) {
    const [fullName, setFullName] = useState(currentFullName || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        setLoading(true);
        setError("");
        try {
            await api.updateUser(userId, { full_name: fullName });
            onClose();
            // In a real app we might want to refresh the user context or trigger a re-fetch
            window.location.reload();
        } catch (e: any) {
            setError(e.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onMouseDown={handleBackdropClick}
        >
            <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl border border-border">
                <div className="mb-4">
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                    <p className="text-sm text-muted-foreground">Update your personal information.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Enter your full name"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
