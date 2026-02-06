import { useState, useMemo, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, MapPin, Users, Loader2 } from 'lucide-react';

const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--primary) / 0.8)',
    'hsl(var(--primary) / 0.6)',
    'hsl(var(--primary) / 0.4)',
    'hsl(var(--primary) / 0.2)',
];

export function SpendAnalytics({ organizationId }: { organizationId: string }) {
    const [days, setDays] = useState<'7' | '30'>('30');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        if (organizationId) fetchSpendData();
    }, [organizationId, days]);

    const fetchSpendData = async () => {
        setLoading(true);
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(days));

            const { data: pos, error } = await supabase
                .from('purchase_orders')
                .select(`
          id,
          total_amount,
          location_id,
          supplier:supplier_id (name),
          locations:location_id (name)
        `)
                .eq('organization_id', organizationId)
                .gt('created_at', startDate.toISOString())
                .not('total_amount', 'is', null);

            if (error) throw error;
            setData(pos || []);
        } catch (err) {
            console.error('Error fetching spend data:', err);
        } finally {
            setLoading(false);
        }
    };

    const { byLocation, bySupplier, total } = useMemo(() => {
        const locMap = new Map<string, number>();
        const supMap = new Map<string, number>();
        let total = 0;

        data.forEach(po => {
            const amount = po.total_amount || 0;
            total += amount;

            const locName = po.locations?.name || 'Ubicación Desconocida';
            locMap.set(locName, (locMap.get(locName) || 0) + amount);

            const supName = po.supplier?.name || 'Sin Suplidor';
            supMap.set(supName, (supMap.get(supName) || 0) + amount);
        });

        const byLocation = Array.from(locMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const bySupplier = Array.from(supMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return { byLocation, bySupplier, total };
    }, [data]);

    if (loading) {
        return (
            <Card className="border-0 shadow-sm min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Resumen de Gastos</h3>
                        <p className="text-sm text-muted-foreground">Análisis de compras por periodo</p>
                    </div>
                </div>
                <Tabs value={days} onValueChange={(v) => setDays(v as any)}>
                    <TabsList>
                        <TabsTrigger value="7">7 días</TabsTrigger>
                        <TabsTrigger value="30">30 días</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Total Stat */}
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium opacity-80">Gasto Total ({days}d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">RD${total.toLocaleString()}</div>
                        <p className="text-xs mt-1 opacity-70">Basado en órdenes recibidas/sentidas</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 flex flex-col justify-center">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Top Ubicaciones</span>
                        </div>
                        <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={byLocation.slice(0, 3)} margin={{ left: -20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" /> Gasto por Suplidor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={bySupplier}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                    >
                                        {bySupplier.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {bySupplier.slice(0, 3).map((item, i) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                    <span className="font-medium">RD${item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for future detailed table or secondary metric */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Distribución por Ubicación</CardTitle>
                        <CardDescription>Comparativa de gasto operativo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byLocation}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                                    <YAxis fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `RD$${v / 1000}k`} />
                                    <Tooltip formatter={(v) => `RD$${v.toLocaleString()}`} />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
