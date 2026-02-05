
import { useState, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, X, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const { membership } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // State for Lists
    const [categories, setCategories] = useState<string[]>([]);
    const [units, setUnits] = useState<string[]>([]);

    // State for Inputs
    const [newCategory, setNewCategory] = useState('');
    const [newUnit, setNewUnit] = useState('');

    useEffect(() => {
        if (membership?.organization_id) fetchSettings();
    }, [membership]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('organizations')
                .select('settings')
                .eq('id', membership?.organization_id)
                .single();

            if (error) throw error;

            const settings = (data as any)?.settings || {};
            setCategories(settings.product_categories || ['General']);
            setUnits(settings.product_units || ['Unidad']);

        } catch (error) {
            console.error('Error fetching settings:', error);
            toast({ title: 'Error', description: 'No se pudieron cargar las configuraciones', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (updatedCategories: string[], updatedUnits: string[]) => {
        setSaving(true);
        try {
            // We need to fetch current settings first to merge or just overwrite?
            // Simplest is overwrite specific keys we manage here.
            // Note: Real world might be safer to merge, but we are the only editor of these keys.

            const settingsUpdate = {
                product_categories: updatedCategories,
                product_units: updatedUnits
            };

            // We need to Merge with existing settings (in case other things are there)
            // But Supabase update with jsonb usually replaces unless we use a function.
            // Let's fetch first to be safe (already have them in state, but let's assume strictness isn't huge here).
            // Actually, let's just update the specific keys inside the JSON in JS and send the whole object.

            const { data: current } = await supabase.from('organizations').select('settings').eq('id', membership?.organization_id).single();
            const currentSettings = current?.settings as any || {};

            const newSettings = {
                ...currentSettings,
                ...settingsUpdate
            };

            const { error } = await supabase
                .from('organizations')
                .update({ settings: newSettings })
                .eq('id', membership?.organization_id);

            if (error) throw error;

            setCategories(updatedCategories);
            setUnits(updatedUnits);
            toast({ title: 'Configuración guardada' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Falló al guardar', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const addCategory = () => {
        if (!newCategory.trim()) return;
        if (categories.includes(newCategory.trim())) return;
        const updated = [...categories, newCategory.trim()];
        setNewCategory('');
        saveSettings(updated, units);
    };

    const removeCategory = (cat: string) => {
        const updated = categories.filter(c => c !== cat);
        saveSettings(updated, units);
    };

    const addUnit = () => {
        if (!newUnit.trim()) return;
        if (units.includes(newUnit.trim())) return;
        const updated = [...units, newUnit.trim()];
        setNewUnit('');
        saveSettings(categories, updated);
    };

    const removeUnit = (u: string) => {
        const updated = units.filter(un => un !== u);
        saveSettings(categories, updated);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <OwnerLayout>
            <div className="p-4 lg:p-8 space-y-6 animate-fade-in max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
                    <p className="text-muted-foreground">Personaliza las opciones de tu inventario</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Categorías de Productos</CardTitle>
                            <CardDescription>Opciones disponibles al crear productos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nueva categoría..."
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                                />
                                <Button onClick={addCategory} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <div key={cat} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm">
                                        {cat}
                                        <button onClick={() => removeCategory(cat)} className="text-muted-foreground hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Units */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Unidades de Medida</CardTitle>
                            <CardDescription>Opciones de unidades (Ej: Libra, Caja)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nueva unidad..."
                                    value={newUnit}
                                    onChange={(e) => setNewUnit(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addUnit()}
                                />
                                <Button onClick={addUnit} size="icon">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {units.map(unit => (
                                    <div key={unit} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm">
                                        {unit}
                                        <button onClick={() => removeUnit(unit)} className="text-muted-foreground hover:text-destructive">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </OwnerLayout>
    );
}
