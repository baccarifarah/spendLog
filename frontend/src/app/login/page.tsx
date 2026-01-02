"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
    const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
    });

    useEffect(() => {
        if (user && !loading) {
            router.push("/");
        }
    }, [user, loading, router]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);

        try {
            if (isLogin) {
                await signInWithEmail(formData.email, formData.password);
                showToast("Welcome back!", "success");
            } else {
                await signUpWithEmail(formData.email, formData.password, formData.fullName);
                showToast("Account created! You can now sign in.", "success");
                setIsLogin(true);
            }
        } catch (error: any) {
            let message = error.message || "Authentication failed";
            if (message.includes("Email not confirmed")) {
                message = "Email not confirmed. Please check your inbox or try a different account.";
            }
            showToast(message, "error");
        } finally {
            setAuthLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50/50 dark:bg-zinc-950">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-zinc-900 dark:ring-zinc-800">
                        {isLogin ? (
                            <ArrowRight className="h-6 w-6 text-gray-400" />
                        ) : (
                            <UserPlus className="h-6 w-6 text-gray-400" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {isLogin ? "Welcome back" : "Create an account"}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isLogin ? "Enter your details to access your dashboard." : "Enter your details to get started."}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-zinc-900 dark:ring-zinc-800">
                    <form onSubmit={handleAuth} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Your Name"
                                        className="w-full border-b border-gray-200 bg-transparent py-2 pl-0 pr-8 text-sm outline-none transition-colors focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    className="w-full border-b border-gray-200 bg-transparent py-2 pl-0 pr-8 text-sm outline-none transition-colors focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    Password
                                </label>
                                {isLogin && (
                                    <button type="button" className="text-[10px] font-medium text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white">
                                        Forgot Password ?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full border-b border-gray-200 bg-transparent py-2 pl-0 pr-8 text-sm outline-none transition-colors focus:border-black dark:border-zinc-800 dark:text-white dark:focus:border-white"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="flex w-full items-center justify-center rounded-lg bg-[#111] py-2.5 text-sm font-semibold text-white transition-all hover:bg-black disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            {authLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isLogin ? (
                                "Log in"
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100 dark:border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                            <span className="bg-white px-2 text-gray-400 dark:bg-zinc-900 dark:text-gray-500">
                                OR CONTINUE WITH
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => signInWithGoogle()}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-100 bg-white py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-zinc-800"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span>{isLogin ? "Sign in with Google" : "Sign up with Google"}</span>
                    </button>
                </div>

                {/* Footer Toggle */}
                <div className="text-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-bold text-gray-900 transition-colors hover:text-black dark:text-white dark:hover:text-gray-200"
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </div>

                {!isLogin && (
                    <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
                        By clicking continue, you agree to our <span className="underline cursor-pointer">Terms of Service</span>
                    </p>
                )}
            </div>
        </div>
    );
}
