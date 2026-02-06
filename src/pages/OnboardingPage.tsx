import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Building2, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { t, getLocale } from "@/lib/i18n";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, membership } = useAuth();
  const navigate = useNavigate();
  
  // If already has membership, redirect to dashboard
  useEffect(() => {
    if (membership) {
      navigate('/app/owner', { replace: true });
    }
  }, [membership, navigate]);
  
  // If no user, show error (shouldn't happen normally)
  useEffect(() => {
    if (!user) {
      // User might still be loading - wait a bit
      const timer = setTimeout(() => {
        if (!user) {
          setError("Sesión no encontrada. Por favor inicia sesión novamente.");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !locationName.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }
    
    setLoading(true);
    setError("");

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bienvenido a ReStocka</CardTitle>
          <CardDescription>
            Completa los siguientes pasos para configurar tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="orgName">Nombre de tu Restaurant/Tienda</Label>
              <Input
                id="orgName"
                placeholder="ej. La Casa del Sabor"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={loading}
                autoComplete="organization"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationName">Ubicación Principal</Label>
              <Input
                id="locationName"
                placeholder="ej. Casa Matriz - Santo Domingo"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                disabled={loading}
                autoComplete="street-address"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  Continuar
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
