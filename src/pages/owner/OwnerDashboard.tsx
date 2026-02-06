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
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LowStockItem, PurchaseOrder, Alert, UsageRate } from '@/types/database';
import { StockChartCarousel } from '@/components/charts/StockChartCarousel';
import { StockTrendChart } from '@/components/charts/StockTrendChart';
import { Link } from 'react-router-dom';
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel';
import { StockoutPredictions } from '@/components/ai/StockoutPredictions';
import { createRestockaAI, type AIInsight, type PredictionResult } from '@/lib/ai';

export default function OwnerDashboard() {
  const { membership } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [allStockItems, setAllStockItems] = useState<LowStockItem[]>([]);
  const [draftOrders, setDraftOrders] = useState<PurchaseOrder[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [usageRates, setUsageRates] = useState<UsageRate[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [membership]);

  const fetchDashboardData = async () => {
    // Handle new users without membership
    if (!membership?.organization_id) {
      // User is logged in but has no organization - show empty state
      setLoading(false);
      setLowStockItems([]);
      setAllStockItems([]);
      setDraftOrders([]);
      setAlerts([]);
      setStockHistory([]);
      setUsageRates([]);
      setAiInsights([]);
      setPredictions([]);
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

      // Fetch draft orders
      const { data: ordersData } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .eq('status', 'DRAFT')
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersData) setDraftOrders(ordersData);

      // Fetch alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (alertsData) setAlerts(alertsData);

      // Fetch stock history for trends (optional table)
      try {
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
      } catch (historyErr) {
        // stock_history table may not exist - that's OK
        console.log('Stock history not available');
      }

      // Fetch usage rates for AI predictions
      const { data: usageData } = await supabase
        .from('usage_rates')
        .select('*')
        .eq('organization_id', membership.organization_id);

      if (usageData) {
        setUsageRates(usageData.map((u: any) => ({
          id: u.id,
          product_id: u.product_id,
          location_id: u.location_id,
          daily_usage: u.daily_usage,
          updated_at: u.updated_at,
        })));
      }

      // Generate AI insights
      await generateAIInsights(mappedData, alertsData || [], ordersData?.length || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (
    stockItems: LowStockItem[],
    alertsData: any[],
    draftOrdersCount: number
  ) => {
    setAiLoading(true);
    try {
      const ai = createRestockaAI(membership?.organization_id || '');
      
      // Generate predictions
      const predictionsResult = await ai.predictStockouts(stockItems, usageRates);
      setPredictions(predictionsResult);
      
      // Generate insights
      const insights = await ai.generateInsights(
        predictionsResult,
        [],
        draftOrdersCount,
        stockItems.filter(i => i.status === 'CRITICAL').length
      );
      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleReorderCheck = async () => {
    setReorderLoading(true);
    try {
      const response = await fetch('/api/reorder-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organization_id: membership?.organization_id }),
      });

      if (!response.ok) throw new Error('Error en la verificación');

      const result = await response.json();
      toast({
        title: 'Verificación completada',
        description: `Se revisaron ${result.checked || 0} productos.`,
      });

      fetchDashboardData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo ejecutar la verificación. (TODO: endpoint)',
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
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              Panel de control
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Resumen del estado de tu inventario
            </p>
          </div>
          <Button
            onClick={handleReorderCheck}
            disabled={reorderLoading}
            size="lg"
            className="w-full lg:w-auto gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            {reorderLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Verificar reposición
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
              <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
            </div>
            <p className="mt-4 text-muted-foreground">Cargando datos...</p>
          </div>
        ) : !membership?.organization_id ? (
          // New user - no organization yet
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">¡Bienvenido a ReStocka!</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Tu cuenta está lista. Ahora necesitas crear o unirte a una organización para gestionar tu inventario.
            </p>
            <Button onClick={() => window.location.href = '/app/owner/settings'}>
              Configurar Organización
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Grid - Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-status-danger-bg to-card shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-status-danger/10 rounded-full blur-xl" />
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground">Crítico</p>
                      <p className="text-3xl lg:text-4xl font-bold text-status-danger mt-1">{criticalCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">productos</p>
                    </div>
                    <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-status-danger/10 flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 lg:h-7 lg:w-7 text-status-danger" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-status-warning-bg to-card shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-status-warning/10 rounded-full blur-xl" />
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground">Stock bajo</p>
                      <p className="text-3xl lg:text-4xl font-bold text-status-warning mt-1">{lowCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">productos</p>
                    </div>
                    <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-status-warning/10 flex items-center justify-center">
                      <Package className="h-6 w-6 lg:h-7 lg:w-7 text-status-warning" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-secondary to-card shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-primary/5 rounded-full blur-xl" />
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground">Pendientes</p>
                      <p className="text-3xl lg:text-4xl font-bold text-foreground mt-1">{draftOrders.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">órdenes</p>
                    </div>
                    <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-xl lg:rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 lg:h-7 lg:w-7 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Section - Stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="lg:col-span-2">
                <StockoutPredictions predictions={predictions} loading={aiLoading} />
              </div>
              <AIInsightsPanel insights={aiInsights} loading={aiLoading} />
            </div>

            {/* Charts Grid - Stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <StockChartCarousel data={allStockItems} loading={loading} />
              <StockTrendChart data={stockHistory} loading={loading} />
            </div>

            {/* Main Content Grid - Stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Low Stock Items - Takes 2 columns on desktop */}
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader className="pb-3 lg:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base lg:text-lg">Productos con stock bajo</CardTitle>
                        <CardDescription className="text-xs lg:text-sm">Requieren atención pronto</CardDescription>
                      </div>
                    </div>
                    <Link 
                      to="/app/owner/products" 
                      className="text-xs lg:text-sm text-primary hover:underline flex items-center gap-1 self-start"
                    >
                      Ver todos <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {lowStockItems.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <div className="h-14 w-14 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="h-7 w-7 text-status-success" />
                      </div>
                      <p className="font-medium text-foreground">¡Todo bien!</p>
                      <p className="text-sm text-muted-foreground mt-1">No hay productos con stock bajo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lowStockItems.map((item, index) => (
                        <div
                          key={item.product_id || index}
                          className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 rounded-lg lg:rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-200 gap-2"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full shrink-0 ${
                              item.status === 'CRITICAL' ? 'bg-status-danger' : 'bg-status-warning'
                            }`} />
                            <div className="min-w-0">
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                {item.product_name}
                              </p>
                              <p className="text-xs lg:text-sm text-muted-foreground truncate">
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
                <CardHeader className="pb-3 lg:pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base lg:text-lg">Órdenes</CardTitle>
                      <CardDescription className="text-xs lg:text-sm">Borradores</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {draftOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">Sin órdenes</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {draftOrders.map((order, index) => (
                        <Link
                          key={order.id}
                          to={`/app/owner/purchase-orders`}
                          className="block p-3 lg:p-4 rounded-lg lg:rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 hover:shadow-sm"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-foreground text-sm lg:text-base">
                              #{order.id.slice(0, 8)}
                            </p>
                            <POStatusBadge status={order.status} />
                          </div>
                          <p className="text-xs lg:text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('es-DO', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </Link>
                      ))}
                      <Link 
                        to="/app/owner/purchase-orders"
                        className="block text-center text-xs lg:text-sm text-primary hover:underline pt-2"
                      >
                        Ver todas
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
