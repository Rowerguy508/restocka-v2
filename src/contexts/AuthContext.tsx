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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // If supabase client is not initialized, show demo mode
  const isDemoMode = !supabase;
  
  console.log('[AuthContext] isDemoMode:', isDemoMode, 'supabase:', !!supabase);

  const fetchMembership = async (userId: string) => {
    if (!supabase) return null;
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
    // DEMO MODE: Skip auth, create mock user
    if (isDemoMode) {
      console.log('[AuthContext] Running in DEMO MODE');
      setLoading(false);
      return;
    }

    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    console.log('[AuthContext] Starting initialization...');

    const initAuth = async () => {
      // Safety timeout - force loading to false after 10 seconds
      timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('[AuthContext] Auth initialization timeout - forcing loading=false');
          setLoading(false);
        }
      }, 10000);

      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('[AuthContext] Auth state change:', event, session ? 'with session' : 'no session');
            if (!mounted) return;
            
            setSession(session);
            setUser(session?.user ?? null);
            
            // Clear timeout and set loading to false
            clearTimeout(timeoutId);
            
            // Defer membership fetch
            if (session?.user) {
              console.log('[AuthContext] User found, fetching membership...');
              fetchMembership(session.user.id).then(membership => {
                if (mounted) {
                  console.log('[AuthContext] Membership:', membership);
                  setMembership(membership);
                  setLoading(false);
                }
              });
            } else {
              setMembership(null);
              setLoading(false);
            }
          }
        );

        // THEN check for existing session
        console.log('[AuthContext] Checking for existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          console.log('[AuthContext] Existing session:', session ? 'found' : 'none');
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchMembership(session.user.id).then(membership => {
              if (mounted) {
                setMembership(membership);
                setLoading(false);
              }
            });
          } else {
            setLoading(false);
          }
        }

        return () => {
          mounted = false;
          clearTimeout(timeoutId);
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('[AuthContext] Init error:', error);
        if (mounted) {
          clearTimeout(timeoutId);
          setAuthError(error instanceof Error ? error.message : 'Auth init failed');
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [isDemoMode]);

  const signInWithMagicLink = async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not initialized') };
    }
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
    if (supabase) {
      await supabase.auth.signOut();
    }
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
