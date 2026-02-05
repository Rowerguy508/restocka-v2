import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, MapPin } from "lucide-react";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    if (!orgName.trim()) {
      setError("Por favor ingresa el nombre de tu restaurante");
      return;
    }
    
    if (!user) {
      setError("Error: Usuario no autenticado");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({ name: orgName.trim() })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create location
      const { data: location, error: locError } = await supabase
        .from("locations")
        .insert({ 
          organization_id: org.id, 
          name: locationName.trim() || orgName.trim() 
        })
        .select()
        .single();

      if (locError) throw locError;

      // Create OWNER membership
      const { error: memberError } = await supabase
        .from("memberships")
        .insert({
          user_id: user.id,
          organization_id: org.id,
          location_id: null, // OWNER has access to all locations
          role: "OWNER",
        });

      if (memberError) throw memberError;

      // Success - redirect to dashboard
      navigate("/app/owner");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Error al crear la organización");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">
            Welcome to Restocka
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Let's get you set up with your restaurant inventory management.
          </p>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="orgName" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Restaurant Name
              </Label>
              <Input
                id="orgName"
                placeholder="Mi Restaurante"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationName" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location (optional)
              </Label>
              <Input
                id="locationName"
                placeholder="Main Branch"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button 
              className="w-full" 
              variant="default" 
              onClick={handleGetStarted}
              disabled={loading || !orgName.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
