import { useState, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Trash2, Loader2, Truck, Phone, Mail, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Supplier } from '@/types/database';

export default function SuppliersPage() {
  const { membership } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    whatsapp_phone: '',
    email: '',
    lead_time_hours: 24,
  });

  useEffect(() => {
    fetchSuppliers();
  }, [membership]);

  const fetchSuppliers = async () => {
    if (!membership?.organization_id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        whatsapp_phone: supplier.whatsapp_phone || '',
        email: supplier.email || '',
        lead_time_hours: supplier.lead_time_hours,
      });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', whatsapp_phone: '', email: '', lead_time_hours: 24 });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        whatsapp_phone: formData.whatsapp_phone.trim() || null,
        email: formData.email.trim() || null,
        lead_time_hours: formData.lead_time_hours,
      };

      if (editingSupplier) {
        const { error } = await supabase.from('suppliers').update(payload).eq('id', editingSupplier.id);
        if (error) throw error;
        toast({ title: 'Suplidor actualizado' });
      } else {
        const { error } = await supabase.from('suppliers').insert({
          ...payload,
          organization_id: membership?.organization_id,
        });
        if (error) throw error;
        toast({ title: 'Suplidor creado' });
      }

      setDialogOpen(false);
      fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`¿Eliminar "${supplier.name}"?`)) return;

    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', supplier.id);
      if (error) throw error;
      toast({ title: 'Suplidor eliminado' });
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  return (
    <OwnerLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Suplidores</h1>
            <p className="text-muted-foreground">Gestiona tus proveedores</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo suplidor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSupplier ? 'Editar suplidor' : 'Nuevo suplidor'}</DialogTitle>
                <DialogDescription>
                  Información del proveedor
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Distribuidora Central"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp_phone}
                    onChange={(e) => setFormData({ ...formData, whatsapp_phone: e.target.value })}
                    placeholder="Ej: +1809XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ventas@suplidor.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead_time">Tiempo de entrega (horas)</Label>
                  <Input
                    id="lead_time"
                    type="number"
                    min="1"
                    value={formData.lead_time_hours}
                    onChange={(e) => setFormData({ ...formData, lead_time_hours: parseInt(e.target.value) || 24 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingSupplier ? 'Guardar' : 'Crear'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : suppliers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay suplidores. ¡Agrega el primero!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <Card key={supplier.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    {supplier.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {supplier.whatsapp_phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {supplier.whatsapp_phone}
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {supplier.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {supplier.lead_time_hours}h de entrega
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(supplier)}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(supplier)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
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
