import { useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Crown, Building2 } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '$0',
    period: '/month',
    icon: Zap,
    features: [
      'Up to 100 products',
      '1 location',
      'Basic inventory tracking',
      'Email support',
    ],
    cta: 'Current Plan',
    disabled: true,
    planId: 'free',
  },
  {
    name: 'Pro',
    description: 'For growing restaurants',
    price: '$29',
    period: '/month',
    icon: Crown,
    features: [
      'Unlimited products',
      'Up to 5 locations',
      'Advanced analytics',
      'Auto reorder rules',
      'Priority support',
      'WhatsApp notifications',
    ],
    cta: 'Upgrade to Pro',
    disabled: false,
    planId: 'pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For restaurant chains',
    price: '$99',
    period: '/month',
    icon: Building2,
    features: [
      'Everything in Pro',
      'Unlimited locations',
      'Multi-user teams',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    disabled: false,
    planId: 'enterprise',
  },
];

export default function PricingPage() {
  const { subscription } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') {
      alert('Contact us at sales@restocka.app for enterprise pricing');
      return;
    }
    
    setLoading(true);
    
    // Create Stripe checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { planId },
    });
    
    if (error) {
      alert('Error creating checkout session');
      setLoading(false);
      return;
    }
    
    // Redirect to Stripe checkout
    if (data?.url) {
      window.location.href = data.url;
    }
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that fits your restaurant
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <Card 
            key={plan.name}
            className={`relative ${
              plan.popular ? 'border-green-500 border-2 shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <plan.icon className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-center">{plan.name}</CardTitle>
              <CardDescription className="text-center">
                {plan.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                disabled={plan.disabled || loading}
                onClick={() => handleUpgrade(plan.planId)}
              >
                {loading ? 'Processing...' : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  );
}
