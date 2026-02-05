
import { useState, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Plus, Pencil, Loader2, MapPin, MapPinned, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Location } from '@/types/database';
import { useLocationContext } from '@/contexts/LocationContext';

export default function LocationsPage() {
    const { membership } = useAuth();
    const { refreshLocations } = useLocationContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState<Location[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        timezone: 'UTC',
    });

    useEffect(() => {
        if (membership?.organization_id) {
            fetchLocations();
        }
    }, [membership]);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('locations')
                .select('*')
                .eq('organization_id', membership?.organization_id)
                .order('name');

            if (error) throw error;
            setLocations(data || []);
        } catch (error) {
            console.error('Error fetching locations:', error);
            toast({ title: 'Error', description: 'No se pudieron cargar las ubicaciones', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (location?: Location) => {
        if (location) {
            setEditingLocation(location);
            setFormData({
                name: location.name,
                address: location.address || '',
                timezone: location.timezone || 'UTC',
            });
        } else {
            setEditingLocation(null);
            setFormData({ name: '', address: '', timezone: 'UTC' });
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
            if (editingLocation) {
                const { error } = await supabase
                    .from('locations')
                    .update({
                        name: formData.name.trim(),
                        address: formData.address.trim() || null,
                        timezone: formData.timezone,
                    })
                    .eq('id', editingLocation.id);

                if (error) throw error;
                toast({ title: 'Ubicación actualizada' });
            } else {
                const { error } = await supabase.from('locations').insert({
                    organization_id: membership?.organization_id,
                    name: formData.name.trim(),
                    address: formData.address.trim() || null,
                    timezone: formData.timezone,
                });

                if (error) throw error;
                toast({ title: 'Ubicación creada' });
            }

            setDialogOpen(false);
            await fetchLocations();
            await refreshLocations(); // Update global context
        } catch (error) {
            console.error('Error saving location:', error);
            toast({ title: 'Error', description: 'No se pudo guardar la ubicación', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <OwnerLayout>
            <div className="p-4 lg:p-8 space-y-6 animate-fade-in max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Ubicaciones</h1>
                        <p className="text-muted-foreground">Gestiona los locales de tu negocio</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => openDialog()} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Nueva Ubicación
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}</DialogTitle>
                                <DialogDescription>
                                    {editingLocation ? 'Modifica el nombre o dirección del local' : 'Agrega un nuevo punto de venta o almacén'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Churchill, Blue Mall, etc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Calle, Sector, Ciudad"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Zona Horaria</Label>
                                    <select
                                        id="timezone"
                                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                                        value={formData.timezone}
                                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                    >
                                        <option value="UTC">UTC (Universal)</option>
                                        <option value="America/Santo_Domingo">Dominicana (AST)</option>
                                        <option value="America/New_York">EST (New York)</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {editingLocation ? 'Guardar Cambios' : 'Crear Ubicación'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : locations.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <MapPinned className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No tienes ubicaciones configuradas.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {locations.map((loc) => (
                            <Card key={loc.id} className="overflow-hidden border-sidebar-border/50 hover:border-primary/50 transition-colors">
                                <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 bg-sidebar-accent/10">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        {loc.name}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => openDialog(loc)} className="h-8 w-8">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground truncate">
                                            {loc.address || 'Sin dirección'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                                            {loc.timezone || 'UTC'}
                                        </p>
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
