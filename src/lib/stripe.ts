import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('[Stripe] Publishable key not configured');
}

export const stripePromise = stripePublishableKey 
  ? loadStripe(stripePublishableKey)
  : null;

// Pricing tiers
export const PRICING_TIERS = {
  FREE: {
    id: 'free',
    name: 'Gratis',
    price: 0,
    interval: 'month',
    features: [
      '1 location',
      '50 products',
      'Basic alerts',
      'Email support'
    ],
    limits: {
      locations: 1,
      products: 50,
      aiSuggestions: 10
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    priceId: 'price_pro_TviW8NGRh16RUR',
    features: [
      '3 locations',
      '500 products',
      'AI predictions',
      'Purchase orders',
      'Priority support',
      'Export reports'
    ],
    limits: {
      locations: 3,
      products: 500,
      aiSuggestions: 100
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    priceId: 'price_enterprise_TviWl1tGo8TBhd',
    features: [
      'Unlimited locations',
      'Unlimited products',
      'AI predictions',
      'Purchase orders',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'White-label options'
    ],
    limits: {
      locations: -1,
      products: -1,
      aiSuggestions: -1
    }
  }
};

// Check if user is on a paid plan
export async function checkSubscriptionStatus(supabase: any, userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return 'free';
    }

    return data.subscription_status === 'active' ? data.subscription_tier : 'free';
  } catch (err) {
    console.error('[Stripe] Error checking subscription:', err);
    return 'free';
  }
}

// Get remaining usage for current period
export function getUsageRemaining(tier: string, currentUsage: { products: number; ai: number }): {
  products: number;
  ai: number;
  unlimited: boolean;
} {
  const limits = PRICING_TIERS[tier as keyof typeof PRICING_TIERS]?.limits || PRICING_TIERS.FREE.limits;
  
  return {
    products: limits.products === -1 ? -1 : Math.max(0, limits.products - currentUsage.products),
    ai: limits.aiSuggestions === -1 ? -1 : Math.max(0, limits.aiSuggestions - currentUsage.ai),
    unlimited: limits.products === -1
  };
}

// Show upgrade banner reason
export function getUpgradeReason(usage: ReturnType<typeof getUsageRemaining>, tier: string): {
  show: boolean;
  message: string;
  cta: string;
} | null {
  if (tier === 'enterprise') return null;
  
  if (usage.products === 0) {
    return {
      show: true,
      message: `Has alcanzado el límite de ${usage.unlimited ? 'productos' : 'productos permitidos'}`,
      cta: 'Upgrade a Pro para más productos'
    };
  }
  
  return null;
}
