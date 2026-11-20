"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "../lib/supabase/client.js";

const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
  // Aliases for backward compatibility
  signin: async () => {},
  signup: async () => {},
  signout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Load user profile from public.profiles table
  const fetchProfile = useCallback(async (userId) => {
    if (!userId || !supabase?.from) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.warn("[Auth] Could not fetch profile:", error.message);
      }
      return data || null;
    } catch (e) {
      return null;
    }
  }, [supabase]);

  // Sync state with current session
  const syncSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    const currentUser = currentSession?.user || null;
    setUser(currentUser);

    if (currentUser) {
      const userProfile = await fetchProfile(currentUser.id);
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Initial session retrieval
    if (supabase?.auth?.getSession) {
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        if (mounted) {
          syncSession(initialSession);
        }
      });

      // Listen for auth state changes (sign in, sign out, token refresh, OAuth callback)
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          if (mounted) {
            syncSession(newSession);
          }
        }
      );

      return () => {
        mounted = false;
        authListener?.subscription?.unsubscribe?.();
      };
    } else {
      setLoading(false);
    }
  }, [supabase, syncSession]);

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    await syncSession(data.session);
    return data;
  };

  const signUpWithEmail = async (email, password, fullName = "") => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          name: fullName.trim(),
        },
      },
    });
    if (error) throw error;
    await syncSession(data.session);
    return data;
  };

  const signInWithGoogle = async (redirectTo = "/dashboard") => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const resetPassword = async (email) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const callbackUrl = `${origin}/auth/callback?next=/profile`;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: callbackUrl,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshUser = async () => {
    const { data } = await supabase.auth.getSession();
    await syncSession(data.session);
  };

  // Build combined user representation
  const combinedUser = user
    ? {
        ...user,
        profile: {
          name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "",
          segment: profile?.segment || "undergrad",
          stream: profile?.stream || "",
          streamOrCourse: profile?.stream || "",
          isMinor: profile?.is_minor || false,
          parentalConsent: profile?.parental_consent || false,
          ...profile,
        },
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: combinedUser,
        profile,
        session,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        signOut,
        refreshUser,
        // Backward compatibility aliases
        signin: signInWithEmail,
        signup: (payload) => signUpWithEmail(payload.email, payload.password, payload.name),
        signout: signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
