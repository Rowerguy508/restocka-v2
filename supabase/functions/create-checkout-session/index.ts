import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';

serve(async (req) => {
  try {
    const { planId } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No auth header' }), { status: 401 });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    
    // Get user's organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();
    
    if (!membership) {
      return new Response(JSON.stringify({ error: 'No organization found' }), { status: 400 });
    }
    
    // Pricing (in cents)
    const prices = {
      pro: 2900,    // $29/month
      enterprise: 9900,  // $99/month
    };
    
    const amount = prices[planId as keyof typeof prices] || prices.pro;
    
    // Initialize Stripe
    const stripe = new stripeSecretKey ? new Stripe(stripeSecretKey) : null;
    
    if (!stripe) {
      // Return a demo mode response for testing without Stripe
      return new Response(JSON.stringify({
        url: `${req.headers.get('origin')}/billing?demo=true&plan=${planId}`
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Create or get Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', membership.organization_id)
      .single();
    
    let customerId = subscription?.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          organization_id: membership.organization_id,
          user_id: user.id,
        },
      });
      
      customerId = customer.id;
      
      // Save customer ID
      await supabase
        .from('subscriptions')
        .upsert({
          organization_id: membership.organization_id,
          stripe_customer_id: customerId,
          plan: 'free',
          status: 'active',
        });
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Restocka ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
              description: planId === 'pro' 
                ? 'Up to 5 locations, unlimited products' 
                : 'Unlimited locations, API access',
            },
            unit_amount: amount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/billing?success=true`,
      cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        organization_id: membership.organization_id,
        user_id: user.id,
        plan: planId,
      },
    });
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

// Mock Stripe class for when no key is configured
class Stripe {
  constructor(private key: string) {}
  customers = {
    create: async (data: any) => ({ id: 'cus_demo_' + Math.random().toString(36).substr(2, 9) })
  };
  checkout = {
    sessions: {
      create: async (data: any) => ({ url: data.success_url + '&session_id=demo' }))
    }
  };
}
