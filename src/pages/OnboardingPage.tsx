import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, MapPin, Navigation, X } from "lucide-react";

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [useDeviceLocation, setUseDeviceLocation] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{lat: number; lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation no disponible en tu navegador");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setUseDeviceLocation(true);
        // Auto-fill location name with coordinates
        setLocationName(`Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError("No se pudo obtener tu ubicación");
        setLocationLoading(false);
      }
    );
  };

  // Clear device location
  const handleClearLocation = () => {
    setLocationCoords(null);
    setUseDeviceLocation(false);
    setLocationName("");
  };

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

      // Prepare location data
      const locationData: any = { 
        organization_id: org.id, 
        name: locationName.trim() || orgName.trim(),
      };

      // Add device coordinates if available
      if (useDeviceLocation && locationCoords) {
        locationData.latitude = locationCoords.lat;
        locationData.longitude = locationCoords.lng;
      }

      // Create location
      const { data: location, error: locError } = await supabase
        .from("locations")
        .insert(locationData)
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
                Restaurant Name *
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

            {/* Device Location Option */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Use Device Location
              </Label>
              
              {useDeviceLocation && locationCoords ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1 text-sm text-green-700">
                    📍 {locationCoords.lat.toFixed(5)}, {locationCoords.lng.toFixed(5)}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleClearLocation}
                    className="text-green-700 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="w-full"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Obteniendo ubicación...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Share Location
                    </>
                  )}
                </Button>
              )}
              
              {locationError && (
                <p className="text-xs text-destructive">{locationError}</p>
              )}
              
              <p className="text-xs text-muted-foreground">
                Share your device location to automatically set up your restaurant's coordinates.
              </p>
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
