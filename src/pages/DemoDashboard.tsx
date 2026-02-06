import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, ShoppingCart, Bell, Zap, DollarSign, Users, BarChart3, Settings, ChevronRight, Home, User, Menu, Plus, Search, TrendingDown, ArrowUpRight, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const DEMO_PRODUCTS = [
  { id: 1, name: 'Pollo Entero', category: 'Proteínas', stock: 5, unit: 'kg', min_stock: 20, price: 180, supplier: 'Carnes Don Pedro', trend: 'down', consumption_rate: 3.2 },
  { id: 2, name: 'Arroz Superior', category: 'Granos', stock: 45, unit: 'libras', min_stock: 30, price: 45, supplier: 'Molinos RD', trend: 'stable', consumption_rate: 5.1 },
  { id: 3, name: 'Habichuelas Rojas', category: 'Granos', stock: 18, unit: 'libras', min_stock: 15, price: 85, supplier: 'Molinos RD', trend: 'up', consumption_rate: 4.8 },
  { id: 4, name: 'Cebolla Nacional', category: 'Verduras', stock: 8, unit: 'libras', min_stock: 10, price: 35, supplier: 'Verduras La Familia', trend: 'down', consumption_rate: 2.5 },
  { id: 5, name: 'Papas Criollas', category: 'Verduras', stock: 15, unit: 'libras', min_stock: 25, price: 55, supplier: 'Verduras La Familia', trend: 'stable', consumption_rate: 6.2 },
  { id: 6, name: 'Limones', category: 'Frutas', stock: 4, unit: 'libras', min_stock: 8, price: 60, supplier: 'Agricultura del Valle', trend: 'down', consumption_rate: 1.8 },
  { id: 7, name: 'Aguacate', category: 'Frutas', stock: 20, unit: 'unidades', min_stock: 15, price: 25, supplier: 'Agricultura del Valle', trend: 'up', consumption_rate: 4.5 },
  { id: 8, name: 'Sazón Completo', category: 'Especias', stock: 32, unit: 'paquetes', min_stock: 10, price: 28, supplier: 'Especias SD', trend: 'stable', consumption_rate: 2.1 },
  { id: 9, name: 'Pimentón', category: 'Especias', stock: 6, unit: 'libras', min_stock: 5, price: 95, supplier: 'Especias SD', trend: 'down', consumption_rate: 0.8 },
  { id: 10, name: 'Carne Molida 80/20', category: 'Proteínas', stock: 12, unit: 'libras', min_stock: 20, price: 320, supplier: 'Carnes Don Pedro', trend: 'stable', consumption_rate: 5.5 },
  { id: 11, name: 'Mozzarella', category: 'Lácteos', stock: 25, unit: 'libras', min_stock: 15, price: 145, supplier: 'Lácteos La Vega', trend: 'up', consumption_rate: 7.2 },
  { id: 12, name: 'Leche Entera', category: 'Lácteos', stock: 18, unit: 'litros', min_stock: 20, price: 42, supplier: 'Lácteos La Vega', trend: 'down', consumption_rate: 4.1 },
];

const DEMO_ORDERS = [
  { id: 'PO-2024-001', supplier: 'Carnes Don Pedro', items: 3, total: 12500, status: 'pending', date: '2026-02-06', eta: '2026-02-08' },
  { id: 'PO-2024-002', supplier: 'Molinos RD', items: 2, total: 8750, status: 'delivered', date: '2026-02-04', eta: null },
  { id: 'PO-2024-003', supplier: 'Verduras La Familia', items: 4, total: 4200, status: 'in_transit', date: '2026-02-05', eta: '2026-02-06' },
];

const DEMO_AI_INSIGHTS = [
  { id: 1, type: 'warning', title: 'Stock Crítico: Pollo', message: 'Se agotará en 2 días.', action: 'Ordenar Ahora', priority: 'high', impact: 'Alto' },
  { id: 2, type: 'warning', title: 'Stock Bajo: Limones', message: 'Se agotará en 3 días.', action: 'Ordenar', priority: 'medium', impact: 'Medio' },
  { id: 3, type: 'info', title: 'Demanda Alta: Papas', message: 'Consumo aumentó 25% esta semana.', action: 'Revisar', priority: 'medium', impact: 'Medio' },
  { id: 4, type: 'success', title: 'Ahorro en Compras', message: 'Ahorraste RD\$1,250 esta semana.', action: 'Ver detalles', priority: 'low', impact: 'Bajo' },
];

const DEMO_STATS = { totalProducts: 12, lowStock: 4, criticalStock: 2, pendingOrders: 1, inventoryValue: 125000 };

const CATEGORIES = ['Todas', 'Proteínas', 'Verduras', 'Granos', 'Lácteos', 'Especias', 'Frutas'];

export default function DemoDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [cart, setCart] = useState<any[]>([]);
  const [toast, setToast] = useState<{message: string} | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredProducts = DEMO_PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: any) => {
    const existing = cart.find((_, i) => DEMO_PRODUCTS[i]?.id === product.id);
    if (existing) {
      setCart(cart.map((item, i) => DEMO_PRODUCTS[i]?.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    showToast(\`\${product.name} agregado\`);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const getDaysUntilEmpty = (p: any) => Math.floor(p.stock / p.consumption_rate);

  const handleAction = (action: string) => {
    if (action === 'create_order') {
      if (cart.length === 0) { showToast('Agrega productos primero'); return; }
      setShowOrderModal(true);
    } else if (action === 'confirm_order') {
      setCart([]); setShowOrderModal(false); showToast('¡Pedido creado! (DEMO)');
    } else {
      showToast(\`\${action} (DEMO)\`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {toast && <div className="fixed top-4 right-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg z-50">{toast.message}</div>}
      
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-card border-border w-full max-w-md">
            <CardHeader><CardTitle className="text-white">Confirmar Pedido</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item, i) => <div key={i} className="flex justify-between text-sm"><span className="text-gray-300">{item.name} x{item.qty}</span><span className="text-white">\${(item.price * item.qty).toLocaleString()}</span></div>)}
              <div className="border-t pt-4 flex justify-between font-bold"><span className="text-white">Total</span><span className="text-green-400">\${cartTotal.toLocaleString()}</span></div>
              <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setShowOrderModal(false)}>Cancelar</Button><Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction('confirm_order')}>Confirmar</Button></div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-card border-border w-full max-w-md">
            <CardHeader><div className="flex justify-between items-start"><div><CardTitle className="text-white">{selectedProduct.name}</CardTitle><CardDescription>{selectedProduct.category}</CardDescription></div><Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)}><X className="h-5 w-5" /></Button></div></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary/50 rounded-lg"><p className="text-xs text-gray-500">Stock</p><p className="text-xl font-bold text-white">{selectedProduct.stock} {selectedProduct.unit}</p></div>
                <div className="p-3 bg-secondary/50 rounded-lg"><p className="text-xs text-gray-500">Consumo</p><p className="text-xl font-bold text-white">{selectedProduct.consumption_rate}/día</p></div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}><ShoppingCart className="mr-2 h-4 w-4" />Agregar al Pedido</Button>
            </CardContent>
          </Card>
        </div>
      )}

      <aside className={\`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col \${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 z-50\`}>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center"><Package className="h-5 w-5" /></div>
            {sidebarOpen && <div><span className="font-bold text-white">ReStocka</span><Badge variant="secondary" className="ml-1 text-[10px] bg-green-600/20 text-green-400">DEMO</Badge></div>}
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'dashboard', icon: Home, label: 'Panel Principal' },
            { id: 'inventory', icon: Package, label: 'Inventario' },
            { id: 'orders', icon: ShoppingCart, label: 'Pedidos' },
            { id: 'insights', icon: Zap, label: 'AI Insights' },
            { id: 'suppliers', icon: Users, label: 'Proveedores' },
            { id: 'reports', icon: BarChart3, label: 'Reportes' },
            { id: 'settings', icon: Settings, label: 'Configuración' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors \${activeTab === item.id ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-sidebar-accent hover:text-white'}\`}>
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"><User className="h-4 w-4" /></div>
            {sidebarOpen && <div className="flex-1"><p className="text-sm font-medium text-white">Restaurant Demo</p><p className="text-xs text-gray-500">Plan Pro</p></div>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </aside>

      <main className={\`flex-1 flex flex-col \${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300\`}>
        <header className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-white">
              {activeTab === 'dashboard' && 'Panel Principal'}
              {activeTab === 'inventory' && 'Inventario'}
              {activeTab === 'orders' && 'Pedidos'}
              {activeTab === 'insights' && 'AI Insights'}
              {activeTab === 'suppliers' && 'Proveedores'}
              {activeTab === 'reports' && 'Reportes'}
              {activeTab === 'settings' && 'Configuración'}
            </h1>
            <p className="text-sm text-muted-foreground">Restaurant Demo • 6 febrero 2026</p>
          </div>
          <div className="flex items-center gap-3">
            {cart.length > 0 && <Button variant="outline" className="relative" onClick={() => setActiveTab('orders')}><ShoppingCart className="h-4 w-4 mr-2" />Carrito<Badge className="ml-2 bg-green-600">{cart.length}</Badge></Button>}
            <Link to="/login?signup=true"><Button className="bg-green-600 hover:bg-green-700">Crear Cuenta Gratis</Button></Link>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/20 rounded-lg"><Package className="h-5 w-5 text-blue-400" /></div><div><p className="text-2xl font-bold text-white">{DEMO_STATS.totalProducts}</p><p className="text-xs text-muted-foreground">Productos</p></div></div></CardContent></Card>
                <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-500/20 rounded-lg"><AlertTriangle className="h-5 w-5 text-yellow-400" /></div><div><p className="text-2xl font-bold text-yellow-400">{DEMO_STATS.lowStock}</p><p className="text-xs text-muted-foreground">Stock Bajo</p></div></div></CardContent></Card>
                <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-red-500/20 rounded-lg"><TrendingDown className="h-5 w-5 text-red-400" /></div><div><p className="text-2xl font-bold text-red-400">{DEMO_STATS.criticalStock}</p><p className="text-xs text-muted-foreground">Crítico</p></div></div></CardContent></Card>
                <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-500/20 rounded-lg"><DollarSign className="h-5 w-5 text-green-400" /></div><div><p className="text-2xl font-bold text-white">\${(DEMO_STATS.inventoryValue / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Valor</p></div></div></CardContent></Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Bell className="h-5 w-5 text-yellow-400" />Alertas de Inventario</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {DEMO_PRODUCTS.filter(p => p.stock < p.min_stock).slice(0, 4).map(product => {
                      const days = getDaysUntilEmpty(product);
                      return (
                        <div key={product.id} className={\`p-3 rounded-lg border cursor-pointer \${days <= 2 ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}\`} onClick={() => setSelectedProduct(product)}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">{product.name}</span>
                            <Badge variant={days <= 2 ? 'destructive' : 'secondary'}>{days} días</Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-2"><Progress value={(product.stock / product.min_stock) * 100} className="flex-1 h-1.5" /><span className="text-xs text-gray-400">{product.stock}/{product.min_stock}</span></div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Zap className="h-5 w-5 text-green-400" />Predicciones AI</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {DEMO_AI_INSIGHTS.map(insight => (
                      <div key={insight.id} className={\`p-3 rounded-lg border \${insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' : insight.type === 'success' ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}\`}>
                        <p className="font-medium text-white text-sm">{insight.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{insight.message}</p>
                        <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700" onClick={() => showToast(\`\${insight.action} (DEMO)\`)}>{insight.action}</Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-card border-border text-white placeholder:text-gray-500" /></div>
                <select className="px-3 py-2 bg-card border border-border rounded-lg text-white text-sm" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <Button className="bg-green-600 hover:bg-green-700"><Plus className="mr-2 h-4 w-4" />Agregar</Button>
              </div>
              <Card className="bg-card border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50 border-b border-border"><tr><th className="text-left p-4 text-sm font-medium text-gray-400">Producto</th><th className="text-left p-4 text-sm font-medium text-gray-400">Stock</th><th className="text-left p-4 text-sm font-medium text-gray-400">Consumo</th><th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th><th className="text-left p-4 text-sm font-medium text-gray-400">Acción</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {filteredProducts.map(product => {
                        const days = getDaysUntilEmpty(product);
                        return (
                          <tr key={product.id} className="hover:bg-secondary/30 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                            <td className="p-4"><p className="font-medium text-white">{product.name}</p><p className="text-sm text-gray-500">{product.category}</p></td>
                            <td className="p-4"><div className="flex items-center gap-2"><span className={days <= 3 ? 'text-red-400' : 'text-white'}>{product.stock} {product.unit}</span></div><Progress value={(product.stock / product.min_stock) * 100} className="w-20 h-1.5 mt-1" /></td>
                            <td className="p-4 text-gray-300">{product.consumption_rate}/{product.unit}/día</td>
                            <td className="p-4"><Badge variant={days <= 2 ? 'destructive' : days <= 3 ? 'secondary' : 'default'}>{days <= 2 ? 'Crítico' : days <= 3 ? 'Bajo' : 'Normal'}</Badge></td>
                            <td className="p-4"><Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Ordenar</Button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {cart.length > 0 && (
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ShoppingCart className="h-4 w-4" />Carrito ({cart.length} items)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">{cart.map((item, i) => <div key={i} className="flex justify-between text-sm"><span className="text-gray-300">{item.name} x{item.qty}</span><span className="text-white">\${(item.price * item.qty).toLocaleString()}</span></div>)}</div>
                    <div className="flex justify-between font-bold mb-4"><span className="text-white">Total</span><span className="text-green-400">\${cartTotal.toLocaleString()}</span></div>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleAction('create_order')}>Confirmar Pedido</Button>
                  </CardContent>
                </Card>
              )}
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-white">Historial de Pedidos</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {DEMO_ORDERS.map(order => (
                    <div key={order.id} className="p-4 border border-border rounded-lg flex items-center justify-between">
                      <div><div className="flex items-center gap-2"><span className="font-medium text-white">{order.id}</span><Badge variant={order.status === 'delivered' ? 'default' : order.status === 'in_transit' ? 'secondary' : 'outline'}>{order.status === 'pending' ? 'Pendiente' : order.status === 'in_transit' ? 'En Camino' : 'Entregado'}</Badge></div><p className="text-sm text-gray-400 mt-1">{order.supplier} • \${order.total.toLocaleString()}</p></div>
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'insights' && (
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Zap className="h-5 w-5 text-green-400" />Predicciones de Inteligencia Artificial</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {DEMO_AI_INSIGHTS.map(insight => (
                  <div key={insight.id} className={\`p-4 rounded-lg border \${insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' : insight.type === 'success' ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}\`}>
                    <div className="flex items-start justify-between"><div><p className="font-medium text-white">{insight.title}</p><p className="text-sm text-gray-400 mt-1">{insight.message}</p></div><Badge variant="outline" className="border-gray-600 text-gray-400">{insight.impact}</Badge></div>
                    <div className="mt-3 flex gap-2"><Button size="sm" className="bg-green-600">{insight.action}</Button><Button size="sm" variant="outline">Dismiss</Button></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'suppliers' && (
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-white">Proveedores</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Carnes Don Pedro', category: 'Proteínas', rating: 4.8, orders: 45 },
                  { name: 'Molinos RD', category: 'Granos', rating: 4.5, orders: 38 },
                  { name: 'Verduras La Familia', category: 'Verduras', rating: 4.7, orders: 52 },
                  { name: 'Lácteos La Vega', category: 'Lácteos', rating: 4.6, orders: 41 },
                ].map(s => (
                  <div key={s.name} className="p-4 border border-border rounded-lg hover:bg-secondary/30">
                    <div className="flex items-start justify-between"><div><h4 className="font-medium text-white">{s.name}</h4><p className="text-sm text-gray-500">{s.category}</p></div><span className="text-yellow-500">★ {s.rating}</span></div>
                    <p className="text-sm text-gray-500 mt-2">{s.orders} pedidos</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'reports' && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-card border-border"><CardContent className="p-6 text-center"><p className="text-3xl font-bold text-green-400">-18%</p><p className="text-sm text-gray-400">Desperdicio vs Mes</p></CardContent></Card>
              <Card className="bg-card border-border"><CardContent className="p-6 text-center"><p className="text-3xl font-bold text-blue-400">\$2,450</p><p className="text-sm text-gray-400">Ahorro en Pedidos</p></CardContent></Card>
              <Card className="bg-card border-border"><CardContent className="p-6 text-center"><p className="text-3xl font-bold text-white">4.2 días</p><p className="text-sm text-gray-400">Inventario Promedio</p></CardContent></Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-white">Configuración</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Notificaciones de Stock Bajo', enabled: true },
                  { label: 'Predicciones AI', enabled: true },
                  { label: 'Auto-pedidos Automáticos', enabled: false },
                  { label: 'Reportes Semanales', enabled: true },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <span className="text-gray-300">{s.label}</span>
                    <button className={\`w-12 h-6 rounded-full transition-colors \${s.enabled ? 'bg-green-600' : 'bg-gray-700'}\`} onClick={() => showToast(\`\${s.label} toggled (DEMO)\`)}>
                      <div className={\`w-5 h-5 bg-white rounded-full shadow transition-transform \${s.enabled ? 'translate-x-6' : 'translate-x-0.5'}\`} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
