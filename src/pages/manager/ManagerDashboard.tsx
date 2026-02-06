import { useState, useEffect } from 'react';
import { ManagerLayout } from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { StockStatusBadge, POStatusBadge } from '@/components/ui/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Loader2,
  Package,
  Store,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Camera,
  Send,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ManagerDashboardItem, PurchaseOrder, StockStatus } from '@/types/database';

interface OpenOrder extends PurchaseOrder {
  supplier?: { name: string };
  items?: Array<{ quantity: number; product?: { name: string; unit: string } }>;
}

export default function ManagerDashboard() {
  const { membership, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stockItems, setStockItems] = useState<ManagerDashboardItem[]>([]);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);

  // Delivery confirmation
  const [confirmingOrder, setConfirmingOrder] = useState<OpenOrder | null>(null);
  const [deliveryData, setDeliveryData] = useState({
    delivered: true,
    notes: '',
    photo: null as File | null,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Issue report
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueMessage, setIssueMessage] = useState('');
  const [issueLoading, setIssueLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [membership]);

  const fetchDashboardData = async () => {
    if (!membership?.location_id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      // Fetch stock levels for this location
      const { data: stockData } = await supabase
        .from('stock_levels')
        .select(`
          id,
          quantity,
          status,
          products:product_id (id, name, unit)
        `)
        .eq('location_id', membership.location_id);

      if (stockData) {
        setStockItems(
          stockData.map((item: any) => ({
            product_id: item.products?.id,
            product_name: item.products?.name || 'Producto',
            current_qty: item.quantity,
            unit: item.products?.unit || 'unidad',
            status: item.status as StockStatus,
          }))
        );
      }

      // Fetch open orders for this location
      const { data: ordersData } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:supplier_id (name),
          items:purchase_order_items (
            quantity,
            product:product_id (name, unit)
          )
        `)
        .eq('location_id', membership.location_id)
        .eq('status', 'SENT')
        .order('created_at', { ascending: false });

      if (ordersData) setOpenOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!confirmingOrder || !user) return;
    setConfirmLoading(true);

    try {
      let photoUrl = null;

      // Upload photo if provided
      if (deliveryData.photo) {
        const fileName = `${confirmingOrder.id}/${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('delivery-photos')
          .upload(fileName, deliveryData.photo);

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('delivery-photos')
            .getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      }

      // Create delivery confirmation
      const { error: confirmError } = await supabase.from('delivery_confirmations').insert({
        purchase_order_id: confirmingOrder.id,
        confirmed_by: user.id,
        delivered: deliveryData.delivered,
        photo_url: photoUrl,
        notes: deliveryData.notes.trim() || null,
      });

      if (confirmError) throw confirmError;

      // Update order status
      const { error: updateError } = await supabase
        .from('purchase_orders')
        .update({
          status: deliveryData.delivered ? 'DELIVERED' : 'PROBLEM',
        })
        .eq('id', confirmingOrder.id);

      if (updateError) throw updateError;

      toast({
        title: deliveryData.delivered ? '¡Entrega confirmada!' : 'Problema reportado',
      });

      setConfirmingOrder(null);
      setDeliveryData({ delivered: true, notes: '', photo: null });
      fetchDashboardData();
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast({ title: 'Error', description: 'No se pudo confirmar', variant: 'destructive' });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleReportIssue = async () => {
    if (!issueMessage.trim() || !membership) return;
    setIssueLoading(true);

    try {
      const { error } = await supabase.from('alerts').insert({
        organization_id: membership.organization_id,
        location_id: membership.location_id,
        type: 'ISSUE',
        message: issueMessage.trim(),
        resolved: false,
      });

      if (error) throw error;

      toast({ title: 'Problema reportado' });
      setIssueDialogOpen(false);
      setIssueMessage('');
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast({ title: 'Error', description: 'No se pudo reportar', variant: 'destructive' });
    } finally {
      setIssueLoading(false);
    }
  };

  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case 'OK': return 'bg-status-success-bg border-status-success';
      case 'LOW': return 'bg-status-warning-bg border-status-warning';
      case 'CRITICAL': return 'bg-status-danger-bg border-status-danger';
      default: return 'bg-muted border-muted-foreground';
    }
  };

  return (
    <ManagerLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estado de hoy</h1>
          <p className="text-muted-foreground">Resumen de tu ubicación</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !membership?.location_id ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Sin Ubicación Asignada</h2>
              <p className="text-muted-foreground max-w-sm mt-2">
                Ya eres parte del equipo, pero el dueño aún no te ha asignado una sucursal.
              </p>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Contacta al administrador para que te asigne una ubicación.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stock Status */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Inventario</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {stockItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Sin datos de inventario
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {stockItems.map((item, index) => (
                      <div
                        key={item.product_id || index}
                        className={`p-4 rounded-lg border-2 ${getStatusColor(item.status)}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{item.product_name}</span>
                          <StockStatusBadge status={item.status} />
                        </div>
                        <p className="text-2xl font-bold">
                          {item.current_qty} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Open Orders */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Pedidos en camino</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {openOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No hay pedidos pendientes
                  </p>
                ) : (
                  <div className="space-y-3">
                    {openOrders.map((order) => (
                      <div key={order.id} className="p-4 rounded-lg bg-secondary/50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {order.supplier?.name || 'Suplidor'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('es-DO')}
                            </p>
                          </div>
                          <POStatusBadge status={order.status} />
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="text-sm text-muted-foreground mb-3">
                            {order.items.slice(0, 3).map((item: any, i) => (
                              <span key={i}>
                                {item.product?.name} ({item.quantity} {item.product?.unit})
                                {i < Math.min(order.items!.length, 3) - 1 && ', '}
                              </span>
                            ))}
                            {order.items.length > 3 && ` y ${order.items.length - 3} más...`}
                          </div>
                        )}

                        <Button
                          variant="action"
                          className="w-full"
                          onClick={() => {
                            setConfirmingOrder(order);
                            setDeliveryData({ delivered: true, notes: '', photo: null });
                          }}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Confirmar entrega
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report Issue Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full border-status-warning text-status-warning hover:bg-status-warning-bg"
              onClick={() => setIssueDialogOpen(true)}
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Reportar problema
            </Button>
          </>
        )}
      </div>

      {/* Delivery Confirmation Dialog */}
      <Dialog open={!!confirmingOrder} onOpenChange={() => setConfirmingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar entrega</DialogTitle>
            <DialogDescription>
              {confirmingOrder?.supplier?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <Switch
                id="delivered"
                checked={deliveryData.delivered}
                onCheckedChange={(v) => setDeliveryData({ ...deliveryData, delivered: v })}
              />
              <Label htmlFor="delivered" className="font-medium">
                {deliveryData.delivered ? '✅ Todo llegó bien' : '❌ Hubo un problema'}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Foto (opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setDeliveryData({ ...deliveryData, photo: file });
                  }}
                  className="hidden"
                  id="photo-input"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('photo-input')?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {deliveryData.photo ? deliveryData.photo.name : 'Tomar foto'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                value={deliveryData.notes}
                onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })}
                placeholder="¿Algo que reportar?"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingOrder(null)}>
              Cancelar
            </Button>
            <Button
              variant={deliveryData.delivered ? 'success' : 'warning'}
              onClick={handleConfirmDelivery}
              disabled={confirmLoading}
            >
              {confirmLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Issue Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar problema</DialogTitle>
            <DialogDescription>
              Describe el problema para que el dueño lo vea
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              value={issueMessage}
              onChange={(e) => setIssueMessage(e.target.value)}
              placeholder="Ej: Se dañó el freezer, se acabó el gas..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="warning"
              onClick={handleReportIssue}
              disabled={!issueMessage.trim() || issueLoading}
            >
              {issueLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar reporte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ManagerLayout>
  );
}
