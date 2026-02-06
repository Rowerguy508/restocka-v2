import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, ShoppingCart, Bell, Zap, DollarSign, Users, BarChart3, Settings, ChevronRight, Home, User, Menu, FileText, Plus, Search, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// MOCK DATA
const DEMO_PRODUCTS = [
  { id: 1, name: 'Pollo Entero', category: 'Proteínas', stock: 5, unit: 'kg', min_stock: 20, price: 180, supplier: 'Carnes Don Pedro', trend: 'down' },
  { id: 2, name: 'Arroz Superior', category: 'Granos', stock: 45, unit: 'libras', min_stock: 30, price: 45, supplier: 'Molinos RD', trend: 'stable' },
  { id: 3, name: 'Habichuelas Rojas', category: 'Granos', stock: 18, unit: 'libras', min_stock: 15, price: 85, supplier: 'Molinos RD', trend: 'up' },
  { id: 4, name: 'Cebolla Nacional', category: 'Verduras', stock: 8, unit: 'libras', min_stock: 10, price: 35, supplier: 'Verduras La Familia', trend: 'down' },
  { id: 5, name: 'Papas Criollas', category: 'Verduras', stock: 15, unit: 'libras', min_stock: 25, price: 55, supplier: 'Verduras La Familia', trend: 'stable' },
  { id: 6, name: 'Limones', category: 'Frutas', stock: 4, unit: 'libras', min_stock: 8, price: 60, supplier: 'Agricultura del Valle', trend: 'down' },
  { id: 7, name: 'Aguacate', category: 'Frutas', stock: 20, unit: 'unidades', min_stock: 15, price: 25, supplier: 'Agricultura del Valle', trend: 'up' },
  { id: 8, name: 'Sazón Completo', category: 'Especias', stock: 32, unit: 'paquetes', min_stock: 10, price: 28, supplier: 'Especias SD', trend: 'stable' },
  { id: 9, name: 'Pimentón', category: 'Especias', stock: 6, unit: 'libras', min_stock: 5, price: 95, supplier: 'Especias SD', trend: 'down' },
  { id: 10, name: 'Carne Molida 80/20', category: 'Proteínas', stock: 12, unit: 'libras', min_stock: 20, price: 320, supplier: 'Carnes Don Pedro', trend: 'stable' },
  { id: 11, name: 'Mozzarella', category: 'Lácteos', stock: 25, unit: 'libras', min_stock: 15, price: 145, supplier: 'Lácteos La Vega', trend: 'up' },
  { id: 12, name: 'Leche Entera', category: 'Lácteos', stock: 18, unit: 'litros', min_stock: 20, price: 42, supplier: 'Lácteos La Vega', trend: 'down' },
  { id: 13, name: 'Harina de Trigo', category: 'Harinas', stock: 35, unit: 'libras', min_stock: 25, price: 38, supplier: 'Panadería Central', trend: 'stable' },
  { id: 14, name: 'Salsa de Tomate', category: 'Salsas', stock: 12, unit: 'galones', min_stock: 8, price: 65, supplier: 'Conservas RD', trend: 'up' },
  { id: 15, name: 'Aceitunas Verdes', category: 'Toppings', stock: 8, unit: 'libras', min_stock: 5, price: 125, supplier: 'Imports Gourmet', trend: 'stable' },
];

const DEMO_ORDERS = [
  { id: 'PO-2024-001', supplier: 'Carnes Don Pedro', items: 3, total: 12500, status: 'pending' },
  { id: 'PO-2024-002', supplier: 'Molinos RD', items: 2, total: 8750, status: 'delivered' },
  { id: 'PO-2024-003', supplier: 'Verduras La Familia', items: 4, total: 4200, status: 'in_transit' },
];

const DEMO_STATS = {
  totalProducts: 15,
  lowStock: DEMO_PRODUCTS.filter(p => p.stock < p.min_stock).length,
  criticalStock: DEMO_PRODUCTS.filter(p => p.stock < p.min_stock * 0.5).length,
  inventoryValue: DEMO_PRODUCTS.reduce((acc, p) => acc + (p.stock * p.price), 0),
};

export default function DemoDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [toast, setToast] = useState<{message: string} | null>(null);

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredProducts = DEMO_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    showToast(`${product.name} agregado`);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 z-50`}>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-white">ReStocka</span>
                <Badge variant="secondary" className="ml-1 text-[10px] bg-green-600/20 text-green-400">DEMO</Badge>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'dashboard', icon: Home, label: 'Panel' },
            { id: 'inventory', icon: Package, label: 'Inventario' },
            { id: 'orders', icon: ShoppingCart, label: 'Pedidos' },
            { id: 'insights', icon: Zap, label: 'AI Insights' },
            { id: 'suppliers', icon: Users, label: 'Suplidores' },
            { id: 'reports', icon: BarChart3, label: 'Reportes' },
            { id: 'settings', icon: Settings, label: 'Configuración' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.id 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-400 hover:bg-sidebar-accent hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Restaurant Demo</p>
                <p className="text-xs text-gray-500">Plan Pro</p>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg z-50">
            {toast.message}
          </div>
        )}

        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold capitalize text-white">{activeTab}</h1>
            <p className="text-sm text-muted-foreground">Restaurant Demo - Plan Pro</p>
          </div>
          <Link to="/login?signup=true">
            <Button className="bg-green-600 hover:bg-green-700">Crear Cuenta Gratis</Button>
          </Link>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Package className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{DEMO_STATS.totalProducts}</p>
                        <p className="text-xs text-muted-foreground">Productos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">{DEMO_STATS.lowStock}</p>
                        <p className="text-xs text-muted-foreground">Stock Bajo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <TrendingDown className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-400">{DEMO_STATS.criticalStock}</p>
                        <p className="text-xs text-muted-foreground">Crítico</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">${(DEMO_STATS.inventoryValue / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-muted-foreground">Valor Inventario</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts & AI */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Bell className="h-5 w-5 text-yellow-400" />
                      Alertas de Inventario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {DEMO_PRODUCTS.filter(p => p.stock < p.min_stock).map(product => (
                      <div key={product.id} className={`p-3 rounded-lg border flex items-center justify-between ${
                        product.stock < product.min_stock * 0.5 ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
                      }`}>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className={`text-xs ${product.stock < product.min_stock * 0.5 ? 'text-red-400' : 'text-yellow-400'}`}>
                            {product.stock}/{product.min_stock} {product.unit}
                          </p>
                        </div>
                        <Button size="sm" variant={product.stock < product.min_stock * 0.5 ? 'destructive' : 'outline'} onClick={() => addToCart(product)}>
                          Ordenar
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Zap className="h-5 w-5 text-green-400" />
                      Predicciones AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <p className="font-medium text-white">Stock Crítico: Pollo</p>
                      <p className="text-sm text-gray-400 mt-1">Se agotará en 2 días. Ordenar 50kg urgente.</p>
                      <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">Ordenar Ahora →</Button>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="font-medium text-white">Demanda Alta: Papas</p>
                      <p className="text-sm text-gray-400 mt-1">Consumo aumentó 25% esta semana.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <p className="font-medium text-white">Ahorro en Compras</p>
                      <p className="text-sm text-gray-400 mt-1">Ahorraste RD$1,250 esta semana.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Buscar productos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-card border-border text-white placeholder:text-gray-500" />
                </div>
                <Button className="bg-green-600 hover:bg-green-700"><Plus className="mr-2 h-4 w-4" /> Agregar</Button>
              </div>

              <Card className="bg-card border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50 border-b border-border">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Producto</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Stock</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Suplidor</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredProducts.map(product => {
                        const stockPct = (product.stock / product.min_stock) * 100;
                        const isLow = product.stock < product.min_stock;
                        const isCritical = product.stock < product.min_stock * 0.5;
                        return (
                          <tr key={product.id} className="hover:bg-secondary/30">
                            <td className="p-4">
                              <p className="font-medium text-white">{product.name}</p>
                              <p className="text-sm text-gray-500">${product.price}/{product.unit}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={isCritical ? 'text-red-400 font-medium' : isLow ? 'text-yellow-400' : 'text-white'}>{product.stock} {product.unit}</span>
                                {product.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-green-400" />}
                                {product.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-red-400" />}
                              </div>
                              <div className="w-20 h-1.5 bg-gray-700 rounded-full mt-1">
                                <div className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(stockPct, 100)}%` }} />
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant={isCritical ? 'destructive' : isLow ? 'secondary' : 'default'} className={isLow ? 'bg-yellow-500/20 text-yellow-400' : ''}>
                                {isCritical ? 'Crítico' : isLow ? 'Bajo' : 'Normal'}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-gray-400">{product.supplier}</td>
                            <td className="p-4">
                              <Button size="sm" variant="outline" onClick={() => addToCart(product)}>Ordenar</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {cart.length > 0 && (
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">Carrito ({cart.length} items)</h4>
                      <span className="font-bold text-white">${cartTotal}</span>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => { setCart([]); showToast('Pedido creado (DEMO)'); }}>
                      Confirmar Pedido
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-white">Historial de Pedidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {DEMO_ORDERS.map(order => (
                    <div key={order.id} className="p-4 border border-border rounded-lg flex items-center justify-between hover:bg-secondary/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{order.id}</span>
                          <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'in_transit' ? 'secondary' : 'outline'} className={order.status === 'pending' ? 'border-yellow-500 text-yellow-400' : ''}>
                            {order.status === 'pending' ? 'Pendiente' : order.status === 'in_transit' ? 'En Camino' : 'Entregado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{order.supplier} • {order.items} items • ${order.total.toLocaleString()}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">Consumo Semanal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 flex items-end justify-around gap-2">
                      {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                        <div key={i} className="w-full bg-green-600 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="flex justify-around mt-2 text-xs text-gray-500">
                      <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm text-white">Gasto por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {['Proteínas', 'Verduras', 'Granos', 'Lácteos', 'Otros'].map((cat, i) => {
                      const pct = [35, 25, 20, 12, 8][i];
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">{cat}</span><span className="text-gray-500">{pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full">
                            <div className="h-full bg-green-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white">Suplidores</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Carnes Don Pedro', category: 'Proteínas', rating: 4.8 },
                  { name: 'Molinos RD', category: 'Granos', rating: 4.5 },
                  { name: 'Verduras La Familia', category: 'Verduras', rating: 4.7 },
                  { name: 'Lácteos La Vega', category: 'Lácteos', rating: 4.6 },
                  { name: 'Especias SD', category: 'Especias', rating: 4.4 },
                  { name: 'Conservas RD', category: 'Salsas', rating: 4.3 },
                ].map(s => (
                  <div key={s.name} className="p-4 border border-border rounded-lg hover:bg-secondary/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-white">{s.name}</h4>
                        <p className="text-sm text-gray-500">{s.category}</p>
                      </div>
                      <span className="text-yellow-500">★ {s.rating}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">-18%</p>
                    <p className="text-sm text-gray-400">Desperdicio vs Mes Pasado</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-blue-400">$2,450</p>
                    <p className="text-sm text-gray-400">Ahorro en Pedidos</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-bold text-white">4.2 días</p>
                    <p className="text-sm text-gray-400">Inventario Promedio</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white">Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Notificaciones de Stock Bajo', enabled: true },
                  { label: 'Predicciones AI', enabled: true },
                  { label: 'Auto-pedidos Automáticos', enabled: false },
                  { label: 'Reportes Semanales por Email', enabled: true },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <span className="text-gray-300">{s.label}</span>
                    <button 
                      className={`w-12 h-6 rounded-full transition-colors ${s.enabled ? 'bg-green-600' : 'bg-gray-700'}`}
                      onClick={() => showToast(`${s.label} toggled (DEMO)`)}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${s.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
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
