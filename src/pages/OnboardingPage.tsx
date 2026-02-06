import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BulkOnboardingForm } from '@/components/owner/BulkOnboardingForm';

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const { user, membership, role, refreshRole } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Failsafe: If user already has membership, redirect them
    if (membership && role) {
        if (role === 'OWNER') {
            navigate('/app/owner', { replace: true });
        } else {
            navigate('/app/manager', { replace: true });
        }
        return null;
    }

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode.trim() || !user) return;

        setLoading(true);
        try {
            const { data, error } = await (supabase.rpc as any)('join_organization_by_code', { code: inviteCode.trim().toUpperCase() });

            if (error) throw error;
            const result = data as any;

            if (!result.success) {
                throw new Error(result.message);
            }

            toast({
                title: '¡Te has unido!',
                description: `Ahora eres miembro de ${result.org_name}.`
            });

            await refreshRole();
            navigate('/app/manager');

        } catch (error: any) {
            console.error(error);
            if (error.message?.includes('Already a member') || error.message?.includes('Already registered')) {
                toast({ title: 'Ya eres miembro', description: 'Accediendo...' });
                await refreshRole();
                navigate('/app/manager');
                return;
            }

            toast({
                variant: "destructive",
                title: 'Error',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-lg animate-fade-in">
                <div className="mb-8 text-center text-balance">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Comencemos 🚀</h1>
                    <p className="mt-2 text-muted-foreground text-lg">Configura tu espacio de trabajo o únete a uno existente.</p>
                </div>

                <Tabs defaultValue="create" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                        <TabsTrigger value="create" className="text-base">Crear Organización</TabsTrigger>
                        <TabsTrigger value="join" className="text-base">Unirme con Código</TabsTrigger>
                    </TabsList>

                    <TabsContent value="create" className="mt-0">
                        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-2xl">Nueva Organización</CardTitle>
                                <CardDescription className="text-base">Especialmente diseñado para dueños de múltiples sucursales.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BulkOnboardingForm />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="join" className="mt-0">
                        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-2xl">Unirse a un Equipo</CardTitle>
                                <CardDescription className="text-base">Usa el código proporcionado por tu administrador.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleJoin} className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="code" className="text-base">Código de Invitación</Label>
                                        <div className="relative">
                                            <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="code"
                                                placeholder="X9A2B3"
                                                value={inviteCode}
                                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                                className="pl-12 h-12 text-xl uppercase tracking-[0.2em] font-mono"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full h-12 text-lg" variant="secondary" disabled={loading}>
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Unirse al Equipo'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
