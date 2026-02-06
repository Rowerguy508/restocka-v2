import { useState, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Pencil, Trash2, Loader2, Utensils, Search, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/database';

import { useLocationContext } from '@/contexts/LocationContext';

export default function ProductsPage() {
  const { membership } = useAuth();
  const { activeLocation } = useLocationContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['General']); // Default fallbacks
  const [units, setUnits] = useState<string[]>(['Unidad']); // Default fallbacks
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    category: '',
    active: true,
  });

  useEffect(() => {
    if (activeLocation?.id) {
      fetchProducts();
      fetchSettings();
    }
  }, [activeLocation]);

  const fetchSettings = async () => {
    if (!membership?.organization_id) return;
    try {
      const { data } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', membership.organization_id)
        .single();

      if ((data as any)?.settings) {
        const s = (data as any).settings;
        if (s.product_categories && Array.isArray(s.product_categories)) {
          setCategories(s.product_categories);
        }
        if (s.product_units && Array.isArray(s.product_units)) {
          setUnits(s.product_units);
        }
      }
    } catch (e) {
      console.error("Error loading settings", e);
    }
  };

  const fetchProducts = async () => {
    if (!membership?.organization_id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('location_id', activeLocation?.id)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
      // We no longer extract categories from products dynamically, we use the defined Settings list.
      // However, if we wanted to support "Unknown" categories that exist in data but not settings, we could merge them.
      // For now, strict adherence to Settings is cleaner.
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los productos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        unit: product.unit,
        category: product.category || '',
        active: product.active,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', unit: '', category: '', active: true });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.unit.trim()) {
      toast({ title: 'Error', description: 'Nombre y unidad son requeridos', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name.trim(),
            unit: formData.unit.trim(),
            category: formData.category.trim() || null,
            active: formData.active,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: 'Producto actualizado' });
      } else {
        const { error } = await supabase.from('products').insert({
          organization_id: membership?.organization_id,
          location_id: activeLocation?.id,
          name: formData.name.trim(),
          unit: formData.unit.trim(),
          category: formData.category.trim() || null,
          active: formData.active,
        });

        if (error) throw error;
        toast({ title: 'Producto creado' });
      }

      setDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ title: 'Error', description: 'No se pudo guardar el producto', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;
      toast({ title: 'Producto eliminado' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      // Simple validation of headers
      if (!headers.includes('name')) {
        toast({ title: 'Error', description: 'El CSV debe tener una columna "name"', variant: 'destructive' });
        setImporting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quotes? MVP: Just split by comma
        const values = line.split(',');
        const row: any = {};

        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });

        if (!row.name) continue;

        try {
          const { error } = await supabase.from('products').insert({
            organization_id: membership?.organization_id,
            location_id: activeLocation?.id,
            name: row.name,
            unit: row.unit || 'FALSO_UNIT', // Default or error? Schema is text now.
            category: row.category || 'General',
            price_per_unit: parseFloat(row.price) || 0,
            min_order_quantity: parseInt(row.min) || 5,
            active: true
          });

          if (error) throw error;
          successCount++;
        } catch (err) {
          console.error('Row error', err);
          errorCount++;
        }
      }

      toast({
        title: 'Importación completada',
        description: `${successCount} productos importados. ${errorCount} errores.`,
        variant: errorCount > 0 ? 'default' : 'default' // could be destructive if distinct
      });
      setImporting(false);
      setImportDialogOpen(false);
      fetchProducts();
    };

    reader.readAsText(file);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <OwnerLayout>
      <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Productos</h1>
            <p className="text-muted-foreground">Gestiona tu catálogo de inventario</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Importar CSV
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo producto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al inventario'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Arroz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidad *</Label>
                    <select
                      id="unit"
                      className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    >
                      <option value="" disabled>Seleccionar unidad</option>
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <select
                      id="category"
                      className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="" disabled>Seleccionar categoría</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <Label htmlFor="active">Producto activo</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {editingProduct ? 'Guardar cambios' : 'Crear producto'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <select
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{products.length === 0 ? 'No hay productos. ¡Agrega el primero!' : 'No se encontraron productos'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className={!product.active ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {product.unit} {product.category && `• ${product.category}`}
                      </p>
                    </div>
                    {!product.active && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Inactivo</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDialog(product)} className="flex-1">
                    <Pencil className="h-3 w-3 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(product)} className="text-destructive hover:text-destructive shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Import Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importar Productos</DialogTitle>
              <DialogDescription>
                Sube un archivo CSV con las siguientes columnas encabezado:
                <br />
                <code className="text-xs bg-muted p-1 rounded">name, unit, category, price, min</code>
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={importing}
              />
              {importing && <p className="text-sm text-muted-foreground mt-2">Procesando archivo...</p>}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </OwnerLayout>
  );
}
