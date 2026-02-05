import { useState, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, TrendingUp, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product, Location, UsageRate } from '@/types/database';

export default function UsagePage() {
  const { membership } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [usageRates, setUsageRates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchInitialData();
  }, [membership]);

  useEffect(() => {
    if (selectedLocation) {
      fetchUsageRates();
    }
  }, [selectedLocation]);

  const fetchInitialData = async () => {
    if (!membership?.organization_id) return;
    setLoading(true);

    try {
      const [productsRes, locationsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('organization_id', membership.organization_id)
          .eq('active', true)
          .order('name'),
        supabase
          .from('locations')
          .select('*')
          .eq('organization_id', membership.organization_id)
          .order('name'),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (locationsRes.data) {
        setLocations(locationsRes.data);
        if (locationsRes.data.length > 0) {
          setSelectedLocation(locationsRes.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageRates = async () => {
    try {
      const { data } = await supabase
        .from('usage_rates')
        .select('*')
        .eq('location_id', selectedLocation);

      if (data) {
        const rates: Record<string, number> = {};
        data.forEach((rate) => {
          rates[rate.product_id] = rate.daily_usage;
        });
        setUsageRates(rates);
      }
    } catch (error) {
      console.error('Error fetching usage rates:', error);
    }
  };

  const handleUsageChange = (productId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setUsageRates((prev) => ({ ...prev, [productId]: numValue }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const upserts = products.map((product) => ({
        product_id: product.id,
        location_id: selectedLocation,
        daily_usage: usageRates[product.id] || 0,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('usage_rates').upsert(upserts, {
        onConflict: 'product_id,location_id',
      });

      if (error) throw error;
      toast({ title: 'Uso diario guardado' });
    } catch (error) {
      console.error('Error saving usage:', error);
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <OwnerLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Uso diario</h1>
            <p className="text-muted-foreground">Configura cuánto se usa de cada producto por día</p>
          </div>
          <Button onClick={handleSave} disabled={saving || !selectedLocation} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar cambios
          </Button>
        </div>

        {/* Location selector */}
        <div className="max-w-xs">
          <Label>Ubicación</Label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecciona ubicación" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay productos activos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.unit}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={usageRates[product.id] || ''}
                      onChange={(e) => handleUsageChange(product.id, e.target.value)}
                      placeholder="0"
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">{product.unit} / día</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
