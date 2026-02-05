import { useState, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product, Location, Supplier, ReorderRule, AutomationMode } from '@/types/database';

export default function RulesPage() {
  const { membership } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [rules, setRules] = useState<Record<string, Partial<ReorderRule>>>({});

  useEffect(() => {
    fetchInitialData();
  }, [membership]);

  useEffect(() => {
    if (selectedLocation) {
      fetchRules();
    }
  }, [selectedLocation]);

  const fetchInitialData = async () => {
    if (!membership?.organization_id) return;
    setLoading(true);

    try {
      const [productsRes, locationsRes, suppliersRes] = await Promise.all([
        supabase.from('products').select('*').eq('organization_id', membership.organization_id).eq('active', true).order('name'),
        supabase.from('locations').select('*').eq('organization_id', membership.organization_id).order('name'),
        supabase.from('suppliers').select('*').eq('organization_id', membership.organization_id).order('name'),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (locationsRes.data) {
        setLocations(locationsRes.data);
        if (locationsRes.data.length > 0) setSelectedLocation(locationsRes.data[0].id);
      }
      if (suppliersRes.data) setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const { data } = await supabase.from('reorder_rules').select('*').eq('location_id', selectedLocation);

      if (data) {
        const rulesMap: Record<string, Partial<ReorderRule>> = {};
        data.forEach((rule) => {
          rulesMap[rule.product_id] = rule;
        });
        setRules(rulesMap);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const updateRule = (productId: string, field: string, value: any) => {
    setRules((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const upserts = products.map((product) => ({
        product_id: product.id,
        location_id: selectedLocation,
        safety_days: rules[product.id]?.safety_days || 3,
        reorder_qty: rules[product.id]?.reorder_qty || 10,
        automation_mode: rules[product.id]?.automation_mode || 'MANUAL',
        emergency_override: rules[product.id]?.emergency_override || false,
        supplier_id: rules[product.id]?.supplier_id || null,
        price_cap: rules[product.id]?.price_cap || null,
        max_spend: rules[product.id]?.max_spend || null,
      }));

      const { error } = await supabase.from('reorder_rules').upsert(upserts, {
        onConflict: 'product_id,location_id',
      });

      if (error) throw error;
      toast({ title: 'Reglas guardadas' });
    } catch (error) {
      console.error('Error saving rules:', error);
      toast({ title: 'Error', description: 'No se pudieron guardar las reglas', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <OwnerLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reglas de reposición</h1>
            <p className="text-muted-foreground">Configura cuándo y cómo reponer cada producto</p>
          </div>
          <Button onClick={handleSave} disabled={saving || !selectedLocation} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar reglas
          </Button>
        </div>

        <div className="max-w-xs">
          <Label>Ubicación</Label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecciona ubicación" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
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
              <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay productos activos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const rule = rules[product.id] || {};
              return (
                <Card key={product.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.unit}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Días de seguridad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={rule.safety_days || 3}
                          onChange={(e) => updateRule(product.id, 'safety_days', parseInt(e.target.value) || 3)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Cantidad a pedir</Label>
                        <Input
                          type="number"
                          min="1"
                          value={rule.reorder_qty || 10}
                          onChange={(e) => updateRule(product.id, 'reorder_qty', parseInt(e.target.value) || 10)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Modo</Label>
                        <Select
                          value={rule.automation_mode || 'MANUAL'}
                          onValueChange={(v) => updateRule(product.id, 'automation_mode', v as AutomationMode)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MANUAL">Manual</SelectItem>
                            <SelectItem value="ASSISTED">Asistido</SelectItem>
                            <SelectItem value="AUTO">Automático</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Suplidor</Label>
                        <Select
                          value={rule.supplier_id || ''}
                          onValueChange={(v) => updateRule(product.id, 'supplier_id', v || null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Precio máximo</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Sin límite"
                          value={rule.price_cap || ''}
                          onChange={(e) => updateRule(product.id, 'price_cap', parseFloat(e.target.value) || null)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Gasto máximo</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Sin límite"
                          value={rule.max_spend || ''}
                          onChange={(e) => updateRule(product.id, 'max_spend', parseFloat(e.target.value) || null)}
                        />
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Switch
                          checked={rule.emergency_override || false}
                          onCheckedChange={(v) => updateRule(product.id, 'emergency_override', v)}
                        />
                        <Label className="text-xs">Permitir pedido de emergencia</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
