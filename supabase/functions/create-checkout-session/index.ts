import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';

// Stripe Price IDs from Stripe Dashboard
const PRICE_IDS = {
  pro: 'price_pro_TviW8NGRh16RUR',       // Pro $29/month
  enterprise: 'price_enterprise_TviWl1tGo8TBhd', // Enterprise $99/month
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

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
    
    // Check for Stripe key
    if (!stripeSecretKey) {
      // Demo mode - update profile directly
      await supabase
        .from('profiles')
        .update({ subscription_tier: planId, subscription_status: 'active' })
        .eq('id', user.id);
      
      return new Response(JSON.stringify({
        url: `${req.headers.get('origin') || 'https://restocka.app'}/billing?demo=true&plan=${planId}`,
        demo: true
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Initialize Stripe
    const Stripe = await import('https://esm.sh/stripe@11.1.0');
    const stripe = new Stripe.default(stripeSecretKey, { apiVersion: '2022-11-15' });
    
    // Create or get Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();
    
    let customerId = profile?.stripe_customer_id;
    
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
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }
    
    // Get price ID
    const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS] || PRICE_IDS.pro;
    
    // Create checkout session with Price ID
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin') || 'https://restocka.app'}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || 'https://restocka.app'}/pricing?canceled=true`,
      metadata: {
        organization_id: membership.organization_id,
        user_id: user.id,
        plan: planId,
      },
    });
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
