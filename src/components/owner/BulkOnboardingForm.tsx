import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Building2, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function BulkOnboardingForm() {
    const { user, refreshRole } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);

    // Form State
    const [orgName, setOrgName] = useState('');
    const [locations, setLocations] = useState(['Sucursal Principal']);
    const [templateId, setTemplateId] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        const { data } = await (supabase.from as any)('onboarding_templates').select('*');
        if (data) setTemplates(data);
    };

    const addLocation = () => setLocations([...locations, '']);
    const removeLocation = (index: number) => {
        if (locations.length > 1) {
            setLocations(locations.filter((_, i) => i !== index));
        }
    };

    const handleLocationChange = (index: number, value: string) => {
        const newLocs = [...locations];
        newLocs[index] = value;
        setLocations(newLocs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!orgName || !templateId || locations.some(l => !l.trim())) {
            toast({ title: 'Error', description: 'Por favor complete todos los campos', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await (supabase.rpc as any)('onboard_org_with_template', {
                p_org_name: orgName,
                p_locations: locations,
                p_template_id: templateId,
                p_owner_id: user.id
            });

            if (error) throw error;

            toast({
                title: '¡Éxito!',
                description: `Se ha creado "${orgName}" con ${locations.length} sucursales.`,
            });

            await refreshRole();
            navigate('/app/owner');

        } catch (err: any) {
            console.error('Onboarding error:', err);
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="orgName">Nombre de la Empresa</Label>
                    <Input
                        id="orgName"
                        placeholder="Ej: Pizza Planet"
                        value={orgName}
                        onChange={e => setOrgName(e.target.value)}
                        className="text-lg"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Plantilla de Configuración (Recipe)</Label>
                    <Select value={templateId} onValueChange={setTemplateId} required>
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecciona una industria..." />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map(t => (
                                <SelectItem key={t.id} value={t.id}>
                                    {t.name} - {t.description}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Sucursales / Ubicaciones</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addLocation} className="gap-1 h-8">
                            <Plus className="h-4 w-4" /> Agregar sucursal
                        </Button>
                    </div>
                    <div className="grid gap-2">
                        {locations.map((loc, index) => (
                            <div key={index} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`Sucursal ${index + 1}`}
                                        value={loc}
                                        onChange={e => handleLocationChange(index, e.target.value)}
                                        className="pl-9"
                                        required
                                    />
                                </div>
                                {locations.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLocation(index)}>
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Configurando sistema...
                        </>
                    ) : (
                        'Crear y Configurar Organización'
                    )}
                </Button>
            </form>

            <Card className="border-dashed border-2 bg-muted/30">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h4 className="font-semibold text-xs transition-colors group-hover:text-primary">¿Necesitas ayuda experta?</h4>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                            Configuramos tus reglas y productos por ti.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 whitespace-nowrap">
                        Servicios Pro
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
