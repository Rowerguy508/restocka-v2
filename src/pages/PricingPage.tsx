import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Crown, Building2, Loader2, X } from 'lucide-react';
import { PRICING_TIERS } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';
import StripeCheckout from '@/components/payments/StripeCheckout';

export default function PricingPage() {
  const { user, subscriptionTier, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      ...PRICING_TIERS.FREE,
      icon: Zap,
      cta: subscriptionTier === 'free' ? 'Plan Actual' : 'Cambiar a Gratis',
      disabled: subscriptionTier === 'free',
      description: 'Perfecto para comenzar'
    },
    {
      ...PRICING_TIERS.PRO,
      icon: Crown,
      cta: subscriptionTier === 'pro' ? 'Plan Actual' : 'Upgrade a Pro',
      disabled: subscriptionTier === 'pro' || subscriptionTier === 'enterprise',
      popular: true,
      description: 'Para restaurants en crecimiento'
    },
    {
      ...PRICING_TIERS.ENTERPRISE,
      icon: Building2,
      cta: subscriptionTier === 'enterprise' ? 'Plan Actual' : 'Contactar Ventas',
      disabled: subscriptionTier === 'enterprise',
      description: 'Para cadenas de restaurants'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (planId === 'enterprise') {
      alert('Contáctanos en sales@restocka.app para pricing enterprise');
      return;
    }
    
    if (planId === 'free') {
      // Free plan - no payment needed
      alert('Ya estás en el plan gratuito');
      return;
    }
    
    setSelectedPlan(planId);
  };

  const handleCloseCheckout = () => {
    setSelectedPlan(null);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4">
      {/* Checkout Modal */}
      {selectedPlan && selectedPlanData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <button
              onClick={handleCloseCheckout}
              className="absolute -top-4 -right-4 z-10 bg-zinc-800 rounded-full p-2 text-zinc-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <StripeCheckout 
              planId={selectedPlan} 
              onClose={handleCloseCheckout}
            />
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Planes Simples y Transparentes
          </h1>
          <p className="text-xl text-zinc-400">
            Elige el plan que se adapte a tu restaurant
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`bg-zinc-900 border-zinc-800 relative ${
                plan.popular ? 'border-green-500 border-2 shadow-lg shadow-green-500/10' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Más Popular
                  </span>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <plan.icon className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-center text-white">{plan.name}</CardTitle>
                <CardDescription className="text-center text-zinc-400">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price === 0 ? '$0' : `$${plan.price}`}
                  </span>
                  <span className="text-zinc-400">
                    {plan.price > 0 ? '/mes' : ''}
                  </span>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                  variant={plan.disabled ? 'secondary' : 'default'}
                  disabled={authLoading || loading !== null}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {authLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-zinc-400">
            Todos los planes incluyen 14 días de prueba gratis. No se requiere tarjeta de crédito.
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            💳 Pagos seguros con Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

function loading(_arg0: string): unknown {
  return null;
}
