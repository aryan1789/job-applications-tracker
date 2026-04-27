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

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, sessionPayload) => {
      const s = sessionPayload ?? null;
      setSession(s as Session | null);
      const u = (s as Session | null)?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else setProfile(null);
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
    refreshProfile,
    signUp: (email, pass) => supabase.auth.signUp({ email, password: pass }),
    signIn: (email, pass) => supabase.auth.signInWithPassword({ email, password: pass }),
    signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }),
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}