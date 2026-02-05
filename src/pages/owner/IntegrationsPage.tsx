
import { useState, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { useLocationContext } from '@/contexts/LocationContext';
import { MessageCircle, ShoppingBag, Truck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Integration, IntegrationProvider } from '@/types/database';

// Helper to get Icon
const getProviderIcon = (provider: IntegrationProvider) => {
    switch (provider) {
        case 'WHATSAPP': return <MessageCircle className="h-6 w-6 text-green-500" />;
        case 'UBER_EATS': return <Truck className="h-6 w-6 text-black" />; // generic for now
        case 'PEDIDOS_YA': return <ShoppingBag className="h-6 w-6 text-red-500" />;
        case 'PRICESMART': return <ShoppingBag className="h-6 w-6 text-blue-600" />;
        default: return <AlertCircle className="h-6 w-6" />;
    }
};

const getProviderLabel = (provider: IntegrationProvider) => {
    switch (provider) {
        case 'WHATSAPP': return 'WhatsApp Business';
        case 'UBER_EATS': return 'Uber Eats';
        case 'PEDIDOS_YA': return 'PedidosYa';
        case 'PRICESMART': return 'PriceSmart';
        default: return provider;
    }
};

export default function IntegrationsPage() {
    const { membership } = useAuth();
    const { activeLocation } = useLocationContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [connecting, setConnecting] = useState<IntegrationProvider | null>(null);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [credentials, setCredentials] = useState({ clientId: '', clientSecret: '' });

    useEffect(() => {
        if (activeLocation?.id) fetchIntegrations();
    }, [activeLocation]);

    const fetchIntegrations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('integrations' as any)
                .select('*')
                .eq('location_id', activeLocation?.id);

            if (error) throw error;
            setIntegrations((data || []) as unknown as Integration[]);
        } catch (error) {
            console.error('Error fetching integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const isConnected = (provider: IntegrationProvider) => {
        return integrations.some(i => i.provider === provider && i.status === 'CONNECTED');
    };

    const handleToggle = async (provider: IntegrationProvider) => {
        const existing = integrations.find(i => i.provider === provider);

        if (existing?.status === 'CONNECTED') {
            // Disconnect
            if (!confirm(`¿Desconectar ${getProviderLabel(provider)}?`)) return;

            const { error } = await supabase.from('integrations' as any).delete().eq('id', existing.id);
            if (error) {
                toast({ title: 'Error', description: 'No se pudo desconectar', variant: 'destructive' });
            } else {
                toast({ title: 'Desconectado', description: `${getProviderLabel(provider)} se ha desconectado.` });
                fetchIntegrations();
            }
        } else {
            // Connect flow
            if (provider === 'WHATSAPP') {
                setSelectedProvider('WHATSAPP');
                setWhatsappNumber('');
                setDialogOpen(true);
            } else if (provider === 'PEDIDOS_YA') {
                setSelectedProvider('PEDIDOS_YA');
                setCredentials({ clientId: '', clientSecret: '' });
                setDialogOpen(true);
            } else if (provider === 'PRICESMART') {
                setSelectedProvider('PRICESMART');
                setCredentials({ clientId: '', clientSecret: '' }); // Reuse fields: clientId=ApiKey, clientSecret=RobotId
                setDialogOpen(true);
            } else if (provider === 'UBER_EATS') {
                setSelectedProvider('UBER_EATS');
                setCredentials({ clientId: '', clientSecret: '' });
                setDialogOpen(true);
            } else {
                // Direct connect simulation for others
                connectProvider(provider, {});
            }
        }
    };

    const [skipVerification, setSkipVerification] = useState(false);

    const connectProvider = async (provider: IntegrationProvider, settings: any) => {
        setConnecting(provider);
        try {
            // Special handling for Real API connections
            if (!skipVerification && (provider === 'PEDIDOS_YA' || provider === 'UBER_EATS')) {
                // Timeout wrapper
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Tiempo de espera agotado. Intenta 'Saltar Verificación'.")), 15000));

                const verify = async () => {
                    const funcName = provider === 'UBER_EATS' ? 'connect-ubereats' : 'connect-pedidosya';
                    const { data, error } = await supabase.functions.invoke(funcName, { body: settings });
                    if (error || !data?.success) throw new Error(data?.error || "Error de autenticación.");
                    return data;
                };

                await Promise.race([verify(), timeout]);
            } else {
                // Simulate API delay for others or skipped verification
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const payload = {
                organization_id: membership?.organization_id,
                location_id: activeLocation?.id,
                provider,
                status: 'CONNECTED',
                settings
            };

            const { error } = await supabase.from('integrations' as any).upsert(payload, { onConflict: 'location_id, provider' });

            if (error) throw error;

            toast({ title: 'Conectado', description: `${getProviderLabel(provider)} conectado exitosamente.` });
            setDialogOpen(false);
            setSkipVerification(false); // Reset
            fetchIntegrations();
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Error', description: error.message || 'Falló la conexión', variant: 'destructive' });
        } finally {
            setConnecting(null);
        }
    };

    return (
        <OwnerLayout>
            <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-foreground">Integraciones</h1>
                    <p className="text-muted-foreground">Conecta tus plataformas de delivery y comunicación</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {(['WHATSAPP', 'UBER_EATS', 'PEDIDOS_YA', 'PRICESMART'] as IntegrationProvider[]).map((provider) => {
                            const active = isConnected(provider);
                            return (
                                <Card key={provider} className={`transition-all ${active ? 'border-primary/50 bg-primary/5' : ''}`}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-base font-medium">
                                            {getProviderLabel(provider)}
                                        </CardTitle>
                                        {getProviderIcon(provider)}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm text-muted-foreground mt-2 mb-4">
                                            {provider === 'WHATSAPP' && "Envía alertas y órdenes automáticas por WhatsApp."}
                                            {provider === 'UBER_EATS' && "Sincroniza inventario con Uber Eats (Demo)."}
                                            {provider === 'PEDIDOS_YA' && "Usa PedidosYa Envíos para recoger insumos o registra compras del Market."}
                                            {provider === 'PRICESMART' && "Acceso directo al portal de PriceSmart Business para reabastecimiento."}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-sm font-medium flex items-center gap-2 ${active ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                {active ? <><CheckCircle2 className="h-4 w-4" /> Conectado</> : 'Desconectado'}
                                            </span>
                                            <Switch
                                                checked={active}
                                                onCheckedChange={() => handleToggle(provider)}
                                                disabled={connecting === provider}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedProvider === 'WHATSAPP' ? 'Configurar WhatsApp' :
                                    selectedProvider === 'PEDIDOS_YA' ? 'Conectar PedidosYa Envíos (Restock)' :
                                        selectedProvider === 'UBER_EATS' ? 'Conectar Uber Eats' :
                                            'Conectar PriceSmart (Browse.ai)'}
                            </DialogTitle>
                            <DialogDescription>
                                {selectedProvider === 'WHATSAPP' ? 'Ingresa el número al que se enviarán las alertas.' :
                                    selectedProvider === 'PEDIDOS_YA' ? 'Ingresa tus credenciales de PedidosYa Envíos (Courier) para solicitar recogidas.' :
                                        selectedProvider === 'UBER_EATS' ? 'Ingresa credenciales de Uber Developer Portal (Client Credentials).' :
                                            'Ingresa API Key y Robot ID de Browse.ai.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {selectedProvider === 'WHATSAPP' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Phone Number ID</Label>
                                        <Input
                                            value={credentials.clientId}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                                            placeholder="1234567890..."
                                        />
                                        <p className="text-xs text-muted-foreground">Obtenido en el Meta Developer Portal</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Permanent Access Token</Label>
                                        <Input
                                            type="password"
                                            value={credentials.clientSecret}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                                            placeholder="EAAB..."
                                        />
                                        <p className="text-xs text-muted-foreground">Token de sistema con permisos whatsapp_business_messaging</p>
                                    </div>
                                </>
                            ) : selectedProvider === 'UBER_EATS' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Client ID</Label>
                                        <Input
                                            value={credentials.clientId}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                                            placeholder="client_id_..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Client Secret</Label>
                                        <Input
                                            type="password"
                                            value={credentials.clientSecret}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                                            placeholder="••••••••••••••"
                                        />
                                    </div>
                                </>
                            ) : selectedProvider === 'PRICESMART' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Browse.ai API Key</Label>
                                        <Input
                                            type="password"
                                            value={credentials.clientId}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                                            placeholder="sk_..."
                                        />
                                        <p className="text-xs text-muted-foreground">Convierte PriceSmart en una API con Browse.ai</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Robot ID</Label>
                                        <Input
                                            value={credentials.clientSecret}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                                            placeholder="robot_..."
                                        />
                                    </div>
                                </>
                            ) : selectedProvider === 'PEDIDOS_YA' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>App ID / Client ID</Label>
                                        <Input
                                            value={credentials.clientId}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                                            placeholder="pedidosya_..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>App Secret</Label>
                                        <Input
                                            type="password"
                                            value={credentials.clientSecret}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                                            placeholder="••••••••••••••"
                                        />
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">Conexión directa disponible para esta integración.</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 py-2">
                            <Switch checked={skipVerification} onCheckedChange={setSkipVerification} id="skip-mode" />
                            <Label htmlFor="skip-mode" className="text-xs text-muted-foreground">Saltar verificación (Guardar sin validar)</Label>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={!!connecting}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => {
                                    if (selectedProvider === 'WHATSAPP') {
                                        connectProvider('WHATSAPP', { phone_number_id: credentials.clientId, access_token: credentials.clientSecret });
                                    } else if (selectedProvider === 'PEDIDOS_YA') {
                                        connectProvider('PEDIDOS_YA', credentials);
                                    } else if (selectedProvider === 'PRICESMART') {
                                        connectProvider('PRICESMART', credentials);
                                    } else if (selectedProvider === 'UBER_EATS') {
                                        connectProvider('UBER_EATS', credentials);
                                    } else {
                                        // Fallback
                                        connectProvider(selectedProvider!, {});
                                    }
                                }}
                                disabled={
                                    connecting === selectedProvider ||
                                    (selectedProvider === 'WHATSAPP' && (!credentials.clientId || !credentials.clientSecret)) ||
                                    ((selectedProvider === 'PEDIDOS_YA' || selectedProvider === 'PRICESMART' || selectedProvider === 'UBER_EATS') && (!credentials.clientId || !credentials.clientSecret))
                                }
                            >
                                {connecting === selectedProvider && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                {skipVerification ? 'Guardar' : 'Conectar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </OwnerLayout>
    );
}
