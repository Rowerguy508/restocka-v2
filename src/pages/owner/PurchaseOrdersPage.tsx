import { useState, useEffect } from 'react';
import { OwnerLayout } from '@/components/layout/OwnerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { POStatusBadge } from '@/components/ui/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShoppingCart, Copy, Check, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PurchaseOrder, PurchaseOrderItem, Supplier } from '@/types/database';

interface OrderWithDetails extends PurchaseOrder {
  supplier?: { id: string; name: string; whatsapp_phone: string | null };
  items?: Array<{
    id: string;
    quantity: number;
    unit_price: number | null;
    product: { id: string; name: string; unit: string } | null;
  }>;
}

export default function PurchaseOrdersPage() {
  const { membership } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [membership]);

  const fetchOrders = async () => {
    if (!membership?.organization_id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:supplier_id (id, name, whatsapp_phone),
          items:purchase_order_items (
            id, quantity, unit_price,
            product:product_id (id, name, unit)
          )
        `)
        .eq('organization_id', membership.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyWhatsAppMessage = async (order: OrderWithDetails) => {
    // Generate message or use existing one
    const message = order.whatsapp_message || generateOrderMessage(order);
    
    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(order.id);
      toast({ title: 'Mensaje copiado' });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo copiar', variant: 'destructive' });
    }
  };

  const generateOrderMessage = (order: OrderWithDetails): string => {
    // TODO: This template could come from backend
    let message = `🛒 *Pedido #${order.id.slice(0, 8)}*\n\n`;
    
    if (order.items && order.items.length > 0) {
      message += `*Productos:*\n`;
      order.items.forEach((item: any) => {
        message += `• ${item.product?.name}: ${item.quantity} ${item.product?.unit}\n`;
      });
    }

    if (order.notes) {
      message += `\n📝 Notas: ${order.notes}`;
    }

    message += `\n\n_Enviado desde ReStocka_`;
    return message;
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <OwnerLayout>
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Órdenes de compra</h1>
          <p className="text-muted-foreground">Historial de pedidos a suplidores</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay órdenes de compra</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">
                        Orden #{order.id.slice(0, 8)}
                      </CardTitle>
                      <POStatusBadge status={order.status} />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(order.id)}
                    >
                      {expandedOrder === order.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span>{new Date(order.created_at).toLocaleDateString('es-DO')}</span>
                    {order.supplier && (
                      <>
                        <span>•</span>
                        <span>{order.supplier.name}</span>
                      </>
                    )}
                    {order.total_amount && (
                      <>
                        <span>•</span>
                        <span>RD${order.total_amount.toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </CardHeader>

                {expandedOrder === order.id && (
                  <CardContent className="pt-0">
                    {/* Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium">Productos:</p>
                        <div className="space-y-1">
                          {order.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm bg-secondary/50 px-3 py-2 rounded"
                            >
                              <span>{item.product?.name}</span>
                              <span className="text-muted-foreground">
                                {item.quantity} {item.product?.unit}
                                {item.unit_price && ` @ RD$${item.unit_price}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.notes && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Notas:</p>
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyWhatsAppMessage(order)}
                        className="gap-2"
                      >
                        {copiedId === order.id ? (
                          <Check className="h-4 w-4 text-status-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        Copiar mensaje para WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
