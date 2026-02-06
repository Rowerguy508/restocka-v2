import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Membership, Role } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  membership: Membership | null;
  role: Role | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembership = async (userId: string) => {
    console.log('[Auth] Fetching membership for', userId);
    try {
      setError(null);
      // Try standard RLS first
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('[Auth] RLS Result for membership:', { data, error });

      if (!error && data) {
        return data as Membership;
      }

      console.log('[Auth] Membership RLS failed/empty. Trying RPC...');
      // Fallback: Try RPC if RLS fails (common in new deployments)
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_membership');
      console.log('[Auth] RPC Result:', { rpcData, rpcError });

      if (rpcError) {
        // Only set error if genuine error, not just "no membership found"
        if (error) setError(new Error(error.message));
        return null;
      }

      if (rpcData) {
        return rpcData as unknown as Membership;
      }

      return null;
    } catch (err: any) {
      console.error('Error fetching membership:', err);
      setError(err);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const mem = await fetchMembership(session.user.id);
            setMembership(mem);
          } catch (e) {
            console.error(e);
          }
        } else {
          setMembership(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[Auth] Initial session check:', session ? 'Found Session' : 'No Session');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          console.log('[Auth] calling fetchMembership...');
          const mem = await fetchMembership(session.user.id);
          console.log('[Auth] fetchMembership done:', mem);
          setMembership(mem);
        } catch (e) {
          console.error('[Auth] Error in initial fetch:', e);
        }
      }
      console.log('[Auth] Setting loading = false');
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMembership(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    session,
    membership,
    role: membership?.role ?? null,
    loading,
    error,
    signInWithMagicLink,
    signOut,
    refreshRole: async () => {
      if (user) {
        setLoading(true);
        const mem = await fetchMembership(user.id);
        setMembership(mem);
        setLoading(false);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
