import { useState, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockStatusBadge, POStatusBadge } from '@/components/ui/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertTriangle,
  Package,
  ShoppingCart,
  RefreshCw,
  Loader2,
  TrendingDown,
  Clock,
  CheckCircle2,
  ArrowRight,
  Copy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LowStockItem, PurchaseOrder, Alert } from '@/types/database';
import { StockChartCarousel } from '@/components/charts/StockChartCarousel';
import { StockTrendChart } from '@/components/charts/StockTrendChart';
import { SpendAnalytics } from '@/components/charts/SpendAnalytics';
import { Link } from 'react-router-dom';

import { useLocationContext } from '@/contexts/LocationContext';

export default function OwnerDashboard() {
  const { membership } = useAuth();
  const { activeLocation } = useLocationContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [allStockItems, setAllStockItems] = useState<LowStockItem[]>([]);
  const [draftOrders, setDraftOrders] = useState<PurchaseOrder[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [orgDetails, setOrgDetails] = useState<{ name: string; invite_code: string } | null>(null);
  const [exchangeRate, setExchangeRate] = useState<{ rate: number; date: string } | null>(null);

  useEffect(() => {
    if (activeLocation?.id) fetchDashboardData();
  }, [activeLocation]);

  const fetchDashboardData = async () => {
    if (!membership?.organization_id || !activeLocation?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      // Fetch ALL stock levels for the chart (include location_id)
      const { data: allStockData } = await supabase
        .from('stock_levels')
        .select(`
          id,
          quantity,
          status,
          location_id,
          products:product_id (id, name, unit),
          locations:location_id (id, name)
        `)
        .eq('location_id', activeLocation.id)
        .order('quantity', { ascending: true })
        .limit(100);

      if (allStockData) {
        const mappedData = allStockData.map((item: any) => ({
          product_id: item.products?.id,
          product_name: item.products?.name || 'Producto',
          location_id: item.locations?.id || item.location_id,
          location_name: item.locations?.name || 'Ubicación',
          current_qty: item.quantity,
          unit: item.products?.unit || 'unidad',
          status: item.status,
        }));
        setAllStockItems(mappedData);
        setLowStockItems(mappedData.filter(i => i.status === 'LOW' || i.status === 'CRITICAL'));
      }

      // Fetch low stock items separately if needed
      const { data: stockData } = await supabase
        .from('stock_levels')
        .select(`
          id,
          quantity,
          status,
          products:product_id (id, name, unit),
          locations:location_id (name)
        `)
        .eq('location_id', activeLocation.id)
        .in('status', ['LOW', 'CRITICAL'])
        .limit(10);

      if (stockData && !allStockData) {
        setLowStockItems(stockData.map((item: any) => ({
          product_id: item.products?.id,
          product_name: item.products?.name || 'Producto',
          location_name: item.locations?.name || 'Ubicación',
          current_qty: item.quantity,
          unit: item.products?.unit || 'unidad',
          status: item.status as 'OK' | 'LOW' | 'CRITICAL',
        })));
      }

      const { data: ordersData } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .eq('status', 'DRAFT')
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersData) setDraftOrders(ordersData);

      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (alertsData) setAlerts(alertsData);

      // Fetch stock history for trends
      const { data: historyData } = await supabase
        .from('stock_history')
        .select(`
          id,
          quantity,
          recorded_at,
          products:product_id (name)
        `)
        .order('recorded_at', { ascending: true })
        .limit(100);

      if (historyData) {
        setStockHistory(historyData.map((item: any) => ({
          product_id: item.products?.id,
          product_name: item.products?.name || 'Producto',
          quantity: item.quantity,
          recorded_at: item.recorded_at,
        })));
      }
      // Fetch Organization Details (Name + Invite Code)
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name, invite_code')
        .eq('id', membership.organization_id)
        .single();

      if (orgData) setOrgDetails(orgData);

      // Fetch DR Specific Boosts: Exchange Rate
      fetchExchangeRate();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('dr-lookup', {
        body: { action: 'exchange-rate' }
      });
      if (error) throw error;
      if (data && data.usd_to_dop) {
        setExchangeRate({ rate: data.usd_to_dop, date: data.updated_at });
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
    }
  };

  const handleReorderCheck = async () => {
    setReorderLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reorder-check', {
        body: { organization_id: membership?.organization_id, run_mode: 'EXECUTE' }
      });

      if (error) throw new Error(error.message || 'Error en la verificación');

      toast({
        title: 'Verificación completada',
        description: `Se procesaron ${data.processed || 0} reglas. Órdenes enviadas: ${data.sent || 0}. Borradores: ${data.drafts || 0}.`,
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo ejecutar la verificación.',
        variant: 'destructive',
      });
    } finally {
      setReorderLoading(false);
    }
  };

  const criticalCount = lowStockItems.filter(i => i.status === 'CRITICAL').length;
  const lowCount = lowStockItems.filter(i => i.status === 'LOW').length;

  return (
    <OwnerLayout>
      <div className="p-4 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              Panel de control
              {exchangeRate && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-600 animate-in fade-in slide-in-from-left-2 transition-all shadow-sm">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  DOP/USD: {exchangeRate.rate.toFixed(2)}
                </div>
              )}
            </h1>
            <p className="text-muted-foreground">
              Resumen del estado de tu inventario
            </p>
          </div>
          <Button
            onClick={handleReorderCheck}
            disabled={reorderLoading}
            size="lg"
            className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            {reorderLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Verificar reposición
          </Button>
        </div>

        {/* Invite Code Banner */}
        {orgDetails?.invite_code && (
          <Card className="bg-primary/5 border-primary/20 animate-fade-in">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl">👋</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Código de Invitación</p>
                  <p className="text-xs text-muted-foreground">Comparte esto con tu staff para que se unan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-background px-3 py-1.5 rounded-md border text-lg font-mono font-bold tracking-widest text-primary">
                  {orgDetails.invite_code}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(orgDetails.invite_code);
                    toast({ title: 'Copiado', description: 'Código copiado al portapapeles' });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
              <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
            </div>
            <p className="mt-4 text-muted-foreground">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-status-danger-bg to-card shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-status-danger/10 rounded-full blur-2xl" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Crítico</p>
                      <p className="text-4xl font-bold text-status-danger mt-1">{criticalCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">productos</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-status-danger/10 flex items-center justify-center">
                      <TrendingDown className="h-7 w-7 text-status-danger" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-status-warning-bg to-card shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-status-warning/10 rounded-full blur-2xl" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Stock bajo</p>
                      <p className="text-4xl font-bold text-status-warning mt-1">{lowCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">productos</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-status-warning/10 flex items-center justify-center">
                      <Package className="h-7 w-7 text-status-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-secondary to-card shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-primary/5 rounded-full blur-2xl" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                      <p className="text-4xl font-bold text-foreground mt-1">{draftOrders.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">órdenes</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Clock className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Spend Analytics Section */}
            {membership?.organization_id && (
              <SpendAnalytics organizationId={membership.organization_id} />
            )}

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <StockChartCarousel data={allStockItems} loading={loading} />
              <StockTrendChart data={stockHistory} loading={loading} />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Low Stock Items - Takes 2 columns */}
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Productos con stock bajo</CardTitle>
                        <CardDescription>Requieren atención pronto</CardDescription>
                      </div>
                    </div>
                    <Link
                      to="/app/owner/products"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Ver todos <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {lowStockItems.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <div className="h-16 w-16 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-8 w-8 text-status-success" />
                      </div>
                      <p className="font-medium text-foreground">¡Todo bien!</p>
                      <p className="text-sm text-muted-foreground mt-1">No hay productos con stock bajo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lowStockItems.map((item, index) => (
                        <div
                          key={item.product_id || index}
                          className="group flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-2 w-2 rounded-full ${item.status === 'CRITICAL' ? 'bg-status-danger' : 'bg-status-warning'
                              }`} />
                            <div>
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {item.product_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.location_name} • {item.current_qty} {item.unit}
                              </p>
                            </div>
                          </div>
                          <StockStatusBadge status={item.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Draft Orders */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Órdenes pendientes</CardTitle>
                      <CardDescription>Borradores por aprobar</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {draftOrders.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">Sin órdenes pendientes</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {draftOrders.map((order, index) => (
                        <Link
                          key={order.id}
                          to={`/app/owner/purchase-orders`}
                          className="block p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 hover:shadow-sm"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-foreground">
                              #{order.id.slice(0, 8)}
                            </p>
                            <POStatusBadge status={order.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('es-DO', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </Link>
                      ))}
                      <Link
                        to="/app/owner/purchase-orders"
                        className="block text-center text-sm text-primary hover:underline pt-2"
                      >
                        Ver todas las órdenes
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
              <Card className="border-0 shadow-sm border-l-4 border-l-status-warning">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-status-warning/10 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-status-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Alertas activas</CardTitle>
                      <CardDescription>Problemas que requieren atención</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {alerts.map((alert, index) => (
                      <div
                        key={alert.id}
                        className="p-4 rounded-xl bg-status-warning-bg/50 border border-status-warning/10"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-status-warning mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground leading-snug">
                              {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(alert.created_at).toLocaleString('es-DO', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty state for alerts */}
            {alerts.length === 0 && (
              <Card className="border-0 shadow-sm bg-gradient-to-r from-status-success-bg/50 to-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-status-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-status-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Sin alertas activas</p>
                      <p className="text-sm text-muted-foreground">
                        Todo está funcionando correctamente
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </OwnerLayout>
  );
}
