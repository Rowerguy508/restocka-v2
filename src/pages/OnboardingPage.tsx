import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, MapPin, Navigation, X, CheckCircle } from "lucide-react";
import { t, getLocale, formatCoordinates } from "@/lib/i18n";

// Demo data to seed for new organizations
const DEMO_PRODUCTS = [
  { name: 'Pollo Entero', category: 'Proteínas', unit: 'UNIT' },
  { name: 'Pechuga de Pollo', category: 'Proteínas', unit: 'UNIT' },
  { name: 'Muslos de Pollo', category: 'Proteínas', unit: 'UNIT' },
  { name: 'Papas Fritas', category: 'Acompañamientos', unit: 'UNIT' },
  { name: 'Arroz Blanco', category: 'Acompañamientos', unit: 'UNIT' },
  { name: 'Habichuelas', category: 'Acompañamientos', unit: 'UNIT' },
  { name: 'Ensalada Verde', category: 'Acompañamientos', unit: 'UNIT' },
  { name: 'Salsa BBQ', category: 'Salsas', unit: 'UNIT' },
  { name: 'Salsa Picante', category: 'Salsas', unit: 'UNIT' },
  { name: 'Ketchup', category: 'Salsas', unit: 'UNIT' },
  { name: 'Refresco Cola', category: 'Bebidas', unit: 'UNIT' },
  { name: 'Agua Natural', category: 'Bebidas', unit: 'UNIT' },
  { name: 'Limonada Natural', category: 'Bebidas', unit: 'UNIT' },
  { name: 'Flan de Queso', category: 'Postres', unit: 'UNIT' },
  { name: 'Pastel de Naranja', category: 'Postres', unit: 'UNIT' },
];

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
  const locale = getLocale();

  // Get current location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(locale === 'es' ? "Geolocation no disponible en tu navegador" : "Geolocation not available in your browser");
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
        setLocationName(formatCoordinates(position.coords.latitude, position.coords.longitude));
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(locale === 'es' ? "No se pudo obtener tu ubicación" : "Could not get your location");
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

  // Seed demo data for the new organization
  const seedDemoData = async (orgId: string, locId: string) => {
    try {
      // Create demo products
      const productInserts = DEMO_PRODUCTS.map((p, i) => ({
        organization_id: orgId,
        name: p.name,
        category: p.category,
        unit: p.unit,
        active: true,
      }));

      const { data: products, error: prodError } = await supabase
        .from("products")
        .insert(productInserts)
        .select("id");

      if (prodError) throw prodError;

      // Create stock levels with mixed quantities (some low, some normal)
      if (products && products.length > 0) {
        const stockLevels = products.map((p, i) => {
          // Create realistic mix: 3 critical, 3 low, rest normal
          let onHand: number;
          if (i < 3) {
            onHand = Math.floor(Math.random() * 5) + 3; // 3-7 (CRITICAL)
          } else if (i < 6) {
            onHand = Math.floor(Math.random() * 10) + 12; // 12-21 (LOW)
          } else {
            onHand = Math.floor(Math.random() * 80) + 30; // 30-110 (NORMAL)
          }

          return {
            organization_id: orgId,
            location_id: locId,
            product_id: p.id,
            on_hand: onHand,
            updated_at: new Date().toISOString(),
          };
        });

        const { error: stockError } = await supabase
          .from("stock_levels")
          .insert(stockLevels);

        if (stockError) throw stockError;
      }

      console.log("✅ Demo data seeded successfully");
    } catch (err) {
      console.error("Error seeding demo data:", err);
      // Don't throw - the org was created, just skip seeding
    }
  };

  const handleGetStarted = async () => {
    if (!orgName.trim()) {
      setError(t('error_restaurant_required'));
      return;
    }
    
    if (!user) {
      setError(t('error_auth'));
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
          location_id: null,
          role: "OWNER",
        });

      if (memberError) throw memberError;

      // Seed demo data for this organization
      await seedDemoData(org.id, location.id);

      // Success - redirect to dashboard
      navigate("/app/owner");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(t('error_creating'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">
            {t('welcome')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            {t('setup_subtitle')}
          </p>

          {/* Demo Badge */}
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-700">
              {locale === 'es' 
                ? "Tu organización incluirá productos de ejemplo para que veas cómo funciona."
                : "Your organization will include sample products to see how it works."
              }
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="orgName" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('restaurant_name')}
              </Label>
              <Input
                id="orgName"
                placeholder={t('restaurant_placeholder')}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationName" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('location_optional')}
              </Label>
              <Input
                id="locationName"
                placeholder={t('location_placeholder')}
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Device Location Option */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                {t('use_device_location')}
              </Label>
              
              {useDeviceLocation && locationCoords ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1 text-sm text-green-700">
                    📍 {formatCoordinates(locationCoords.lat, locationCoords.lng)}
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
                      {t('getting_location')}
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      {t('share_location')}
                    </>
                  )}
                </Button>
              )}
              
              {locationError && (
                <p className="text-xs text-destructive">{locationError}</p>
              )}
              
              <p className="text-xs text-muted-foreground">
                {t('location_permission')}
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
                  {t('creating')}
                </>
              ) : (
                t('get_started')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
