import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
}

interface Organization {
  id: string;
  name: string;
}

interface Subscription {
  id: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  subscription: Subscription | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  setSubscription: (sub: Subscription | null) => void;
  fetchData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  subscription: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setOrganization: (organization) => set({ organization }),
  setSubscription: (subscription) => set({ subscription }),
  
  fetchData: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      set({ user: null, loading: false });
      return;
    }
    
    set({ user: { id: user.id, email: user.email! }, loading: false });
    
    // Fetch user's organization from memberships
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, organizations(name)')
      .eq('user_id', user.id)
      .single();
    
    if (membership) {
      set({ 
        organization: { 
          id: membership.organization_id, 
          name: membership.organizations?.name || '' 
        } 
      });
    }
    
    // TODO: Fetch subscription from Stripe
    // For now, default to free
    set({ 
      subscription: { 
        id: '', 
        plan: 'free', 
        status: 'active', 
        current_period_end: '' 
      } 
    });
  },
}));
