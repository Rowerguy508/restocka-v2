import React, { createContext, useContext, useEffect, useState, ErrorBoundary } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchMembership = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching membership:', error);
        return null;
      }
      return data as Membership | null;
    } catch (err) {
      console.error('Error fetching membership:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return;
            setSession(session);
            setUser(session?.user ?? null);
            
            // Defer membership fetch
            if (session?.user) {
              fetchMembership(session.user.id).then(membership => {
                if (mounted) setMembership(membership);
              });
            } else {
              setMembership(null);
            }
            setLoading(false);
          }
        );

        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchMembership(session.user.id).then(membership => {
              if (mounted) setMembership(membership);
            });
          }
          setLoading(false);
        }

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthError(error instanceof Error ? error.message : 'Auth init failed');
          setLoading(false);
        }
      }
    };

    initAuth();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
        },
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Unknown error') };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMembership(null);
  };

  const value: AuthContextType = {
    user,
    session,
    membership,
    role: membership?.role ?? null,
    loading,
    signInWithMagicLink,
    signOut,
  };

  if (authError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-red-400 mb-4">Auth Error</h1>
          <p className="text-muted-foreground mb-4">{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
