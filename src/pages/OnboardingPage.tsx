import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Building2, MapPin, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, membership, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const isDemoMode = !supabase;
  console.log('[Onboarding] isDemoMode:', isDemoMode, 'authLoading:', authLoading, 'user:', !!user);
  
  // If already has membership, redirect to dashboard
  useEffect(() => {
    if (membership) {
      navigate('/app/owner', { replace: true });
    }
  }, [membership, navigate]);
  
  // Check for demo mode or no user
  useEffect(() => {
    if (authLoading) return;
    console.log('[Onboarding] Checking user, isDemoMode:', isDemoMode);
    
    if (isDemoMode) {
      console.log('[Onboarding] Demo mode detected - will allow demo submission');
      return;
    }
    
    if (!user) {
      setError("Sesión no encontrada. Por favor inicia sesión novamente.");
    }
  }, [user, authLoading, isDemoMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orgName.trim() || !locationName.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }
    
    setLoading(true);
    setError("");

    // DEMO MODE: Skip Supabase, just redirect
    if (isDemoMode) {
      console.log('[Onboarding] Demo mode - simulating org creation');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('[Onboarding] Demo org created, redirecting...');
      navigate('/app/owner', { replace: true });
      return;
    }

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: orgName.trim() })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create location
      const { data: loc, error: locError } = await supabase
        .from('locations')
        .insert({ 
          organization_id: org.id, 
          name: locationName.trim(),
          is_default: true 
        })
        .select()
        .single();

      if (locError) throw locError;

      // Create membership for current user
      const { error: memError } = await supabase
        .from('memberships')
        .insert({
          user_id: user!.id,
          organization_id: org.id,
          role: 'OWNER',
          status: 'ACTIVE'
        });

      if (memError) throw memError;

      // Redirect to dashboard
      navigate('/app/owner', { replace: true });
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || "Error al crear la organización");
    } finally {
      setLoading(false);
    }
  };

  // Demo mode banner
  const DemoBanner = () => isDemoMode ? (
    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
      <p className="text-xs text-amber-500">
        <strong>Demo Mode:</strong> Supabase no configurado. Esta es una simulación.
      </p>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-green-500" />
          </div>
          <CardTitle className="text-white text-xl">Bienvenido a ReStocka</CardTitle>
          <CardDescription className="text-zinc-400">
            Completa los siguientes pasos para configurar tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DemoBanner />
            
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-white">Nombre de tu Restaurant/Tienda</Label>
              <Input
                id="orgName"
                placeholder="ej. La Casa del Sabor"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={loading}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                autoComplete="organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationName" className="text-white">Ubicación Principal</Label>
              <Input
                id="locationName"
                placeholder="ej. Casa Matriz - Santo Domingo"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                disabled={loading}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                autoComplete="street-address"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={loading || (isDemoMode && (!orgName.trim() || !locationName.trim()))}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  {isDemoMode ? 'Ver Dashboard (Demo)' : 'Continuar'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
