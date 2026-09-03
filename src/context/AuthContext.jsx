import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * Wraps Supabase Auth (passwordless email sign-in, via a magic link) + the
 * `profiles` row that carries role ('admin' | 'client') and, for clients,
 * which `clients` record they map to.
 *
 * The magic link lands back on the app with the session in the URL —
 * supabase-js's `detectSessionInUrl` (on by default) picks it up and fires
 * onAuthStateChange below, so there's no separate "verify" step to call.
 *
 * Kept deliberately thin so a v2 WebAuthn/passkey sign-in can slot in next
 * to signInWithOtp without touching anything downstream — every consumer
 * only ever reads { session, profile, loading }.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.error('Failed to load profile:', error.message);
      setProfile(null);
      return;
    }
    setProfile(data);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      await loadProfile(data.session?.user?.id);
      if (mounted) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      await loadProfile(newSession?.user?.id);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Sends a magic link (no code to type — click the link, land back here
  // signed in). Requires the Site URL / Redirect URLs allowlist in
  // Supabase → Authentication → URL Configuration to include this app's
  // origin, or Supabase will reject the redirect.
  const requestOtp = useCallback(async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    loading,
    requestOtp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Tightly coupled to AuthProvider above; splitting it into its own file
// for fast-refresh purity isn't worth the indirection here.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
