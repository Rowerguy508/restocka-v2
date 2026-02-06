import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';

// Stripe Price IDs for subscriptions
const PRICE_IDS = {
  pro: 'price_pro_TviW8NGRh16RUR',           // Pro $29/month
  enterprise: 'price_enterprise_TviWl1tGo8TBhd', // Enterprise $99/month
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { planId } = await req.json();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Demo mode if no Stripe key
    if (!stripeSecretKey) {
      console.log('[Stripe] Demo mode - no secret key configured');
      
      // Update profile to selected plan
      await supabase
        .from('profiles')
        .update({ 
          subscription_tier: planId, 
          subscription_status: 'active' 
        })
        .eq('id', user.id);
      
      return new Response(
        JSON.stringify({ 
          clientSecret: 'demo_client_secret',
          demo: true,
          message: 'Configure STRIPE_SECRET_KEY in Vercel for real payments'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const Stripe = await import('https://esm.sh/stripe@11.1.0');
    const stripe = new Stripe.default(stripeSecretKey, {
      apiVersion: '2022-11-15',
    });

    // Get price ID
    const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS] || PRICE_IDS.pro;

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
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create subscription (not one-time payment)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Get payment intent from subscription
    // @ts-ignore
    const paymentIntent = subscription.latest_invoice?.payment_intent;

    if (!paymentIntent) {
      throw new Error('Could not create payment intent');
    }

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
        paymentIntentId: paymentIntent.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Stripe] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
