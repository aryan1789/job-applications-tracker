import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export type UserProfile = {
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
};

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  providerToken: string | null;
  refreshProfile: () => Promise<void>;
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [providerToken, setProviderToken] = useState<string | null>(
    () => localStorage.getItem('gmail_provider_token')
  );

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url')
        .eq('id', userId)
        .single();
      setProfile(data ?? null);
    } catch {
      setProfile(null);
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const res = await supabase.auth.getSession();
        const currentSession = res?.data?.session ?? null;
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) await fetchProfile(currentSession.user.id);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, sessionPayload) => {
      const s = sessionPayload ?? null;
      setSession(s as Session | null);
      const u = (s as Session | null)?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else setProfile(null);

      // Capture the Google access token immediately after OAuth redirect
      if (event === 'SIGNED_IN' && sessionPayload?.provider_token) {
        setProviderToken(sessionPayload.provider_token);
        localStorage.setItem('gmail_provider_token', sessionPayload.provider_token);
      }
      if (event === 'SIGNED_OUT') {
        setProviderToken(null);
        localStorage.removeItem('gmail_provider_token');
      }
    });

    const subscription = authListener?.subscription;

    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const value: AuthState = {
    user,
    session,
    loading,
    profile,
    providerToken,
    refreshProfile,
    signUp: (email, pass) => supabase.auth.signUp({ email, password: pass }),
    signIn: (email, pass) => supabase.auth.signInWithPassword({ email, password: pass }),
    signInWithGoogle: () =>
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          scopes: 'https://www.googleapis.com/auth/gmail.readonly',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      }),
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
