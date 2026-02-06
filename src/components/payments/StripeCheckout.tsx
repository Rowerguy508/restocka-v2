import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { PRICING_TIERS } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey 
  ? loadStripe(stripePublishableKey)
  : null;

interface CheckoutFormProps {
  planId: string;
  planName: string;
  price: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ planId, planName, price, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    // Create payment intent
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('create-payment-intent', {
        body: { planId, amount: price * 100 }, // cents
      });

      if (invokeError) {
        setError(invokeError.message);
        setProcessing(false);
        return;
      }

      // Confirm payment
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pricing?success=true`,
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        setError(paymentError.message);
        setProcessing(false);
      } else {
        // Payment successful!
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-zinc-800 p-4 rounded-lg">
        <PaymentElement />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-400 flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            `Pagar $${price}/mes`
          )}
        </Button>
      </div>
    </form>
  );
}

export default function StripeCheckout({ planId, onClose }: { planId: string; onClose: () => void }) {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const plan = PRICING_TIERS[planId.toUpperCase() as keyof typeof PRICING_TIERS];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Create payment intent
    const createIntent = async () => {
      try {
        const { data, error: invokeError } = await supabase.functions.invoke('create-payment-intent', {
          body: { planId, amount: (plan?.price || 0) * 100 },
        });

        if (invokeError) {
          setError(invokeError.message);
        } else if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          // Demo mode
          setClientSecret('demo_secret');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [planId, user]);

  const handleSuccess = () => {
    alert('¡Pago exitoso! Bienvenido a Restocka Pro.');
    navigate('/app/owner');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="text-center text-red-400">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Error: {error}</p>
            <Button onClick={onClose} variant="outline" className="mt-4">
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-white">Upgrade to {plan?.name}</CardTitle>
        <CardDescription className="text-zinc-400">
          ${plan?.price}/mes - Facturado mensualmente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clientSecret && clientSecret !== 'demo_secret' ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#22c55e',
                  colorBackground: '#18181b',
                  colorText: '#f4f4f5',
                  colorDanger: '#ef4444',
                  fontFamily: 'system-ui, sans-serif',
                },
              },
            }}
          >
            <PaymentForm
              planId={planId}
              planName={plan?.name || ''}
              price={plan?.price || 0}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </Elements>
        ) : (
          // Demo mode
          <div className="text-center py-4">
            <div className="bg-zinc-800 p-4 rounded-lg mb-4">
              <p className="text-zinc-400 text-sm mb-2">💳 Stripe Elements (Demo Mode)</p>
              <p className="text-xs text-zinc-500">
                Configure STRIPE_SECRET_KEY en Vercel para habilitar pagos reales
              </p>
            </div>
            <Button
              onClick={handleSuccess}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Simular Pago Exitoso
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
