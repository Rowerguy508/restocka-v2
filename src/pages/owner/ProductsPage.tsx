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
import { Plus, Pencil, Trash2, Loader2, Utensils, Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/database';

export default function ProductsPage() {
  const { membership } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
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
    fetchProducts();
  }, [membership]);

  const fetchProducts = async () => {
    if (!membership?.organization_id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
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

  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <OwnerLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Productos</h1>
            <p className="text-muted-foreground">Gestiona los productos de tu inventario</p>
          </div>
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
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Ej: libras, unidades, galones"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ej: Granos, Lácteos, Carnes"
                  />
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

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {categories.length > 0 && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
                  <Button variant="outline" size="sm" onClick={() => openDialog(product)}>
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(product)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
