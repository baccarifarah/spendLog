"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { api, setAccessToken } from "@/lib/api";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
    signInWithGoogle: async () => { },
    signInWithEmail: async () => { },
    signUpWithEmail: async () => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // Set global access token for API client to bypass async getSession
                setAccessToken(session?.access_token ?? null);

                setSession(session);
                setUser(session?.user ?? null);
                console.log("[AuthContext] Setting loading to false. Session exists:", !!session);
                setLoading(false);

                // DEBUG: Log token for manual testing
                if (session?.access_token) {
                    // console.log("[Auth] Access Token available");
                }

                if (session?.user) {
                    try {
                        await api.createOrSyncUser({
                            id: session.user.id,
                            email: session.user.email!,
                            full_name: session.user.user_metadata?.full_name,
                            avatar_url: session.user.user_metadata?.avatar_url,
                        });
                    } catch (error) {
                        console.error("Failed to sync user to backend:", error);
                    }
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const signUpWithEmail = async (email: string, password: string, fullName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        if (error) throw error;
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setAccessToken(null);
            setUser(null);
            setSession(null);
            router.replace("/login");
            router.refresh(); // Ensure strict refresh
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signOut,
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail
        }}>
            {children}
        </AuthContext.Provider>
    );
}
