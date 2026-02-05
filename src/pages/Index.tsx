import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Package, MapPin, Bell, TrendingUp, Users, CheckCircle, ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Package,
    title: 'Control de Inventario Simple',
    description: 'Gestiona tus productos de forma sencilla. Nunca te quedes sin lo que necesitas.',
  },
  {
    icon: Bell,
    title: 'Alertas Inteligentes',
    description: 'Recibe notificaciones cuando el stock esté bajo. Descubre tendencias de uso.',
  },
  {
    icon: TrendingUp,
    title: 'Pedidos Automáticos',
    description: 'Reglas de reabastecimiento configurables. Compra solo cuando sea necesario.',
  },
  {
    icon: Users,
    title: 'Equipo Colaborativo',
    description: 'Invita a tu equipo. Cada quien ve lo que necesita ver.',
  },
];

const BENEFITS = [
  'Reduce desperdicios hasta un 30%',
  'Evita quedarte sin productos críticos',
  'Ahorra tiempo en conteos manuales',
  'Historial de precios por proveedor',
  'Multi-ubicación para restaurantes',
  'Integración WhatsApp coming soon',
];

export default function Index() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 bg-green-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">ReStocka</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors">
            Características
          </a>
          <a href="#benefits" className="text-gray-600 hover:text-green-600 transition-colors">
            Beneficios
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-green-600 transition-colors">
            Precios
          </a>
          <Link to="/login">
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              Iniciar Sesión
            </Button>
          </Link>
          <Link to="/login?signup=true">
            <Button className="bg-green-600 hover:bg-green-700">
              Empezar Gratis
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4">
          <a href="#features" className="block py-2 text-gray-600">Características</a>
          <a href="#benefits" className="block py-2 text-gray-600">Beneficios</a>
          <a href="#pricing" className="block py-2 text-gray-600">Precios</a>
          <Link to="/login" className="block py-2 text-green-600 font-medium">
            Iniciar Sesión
          </Link>
          <Link to="/login?signup=true" className="block">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Empezar Gratis
            </Button>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Control de Inventario para{' '}
            <span className="text-green-600">Restaurantes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            La forma más simple de gestionar tu inventario. 
            Alertas automáticas, pedidos inteligentes, y tu equipo siempre informado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login?signup=true">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8">
                Empezar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 border-green-600 text-green-600 hover:bg-green-50">
                Ver Demo
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            No se requiere tarjeta de crédito • Configuración en 2 minutos
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Herramientas poderosas pero simples. Enfocado en lo que realmente importa.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                ¿Por qué Restaurantes eligen ReStocka?
              </h2>
              <ul className="space-y-4">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Ejemplo de Dashboard</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Productos activos</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-600">Stock bajo</span>
                    <span className="font-semibold text-red-600">8</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-600">Pedidos activos</span>
                    <span className="font-semibold text-green-600">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Precios Simples
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Empieza gratis, escala cuando necesites
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-gray-500">/mes</span></div>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>Hasta 100 productos</li>
                <li>1 ubicación</li>
                <li>Alertas básicas</li>
              </ul>
              <Link to="/login?signup=true" className="block">
                <Button className="w-full" variant="outline">Empezar Gratis</Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-green-600 p-6 rounded-xl shadow-lg transform scale-105">
              <h3 className="text-xl font-semibold mb-2 text-white">Pro</h3>
              <div className="text-4xl font-bold mb-4 text-white">$29<span className="text-lg text-green-200">/mes</span></div>
              <ul className="space-y-2 text-sm text-green-100 mb-6">
                <li>Productos ilimitados</li>
                <li>Hasta 5 ubicaciones</li>
                <li>Pedidos automáticos</li>
                <li>API access</li>
              </ul>
              <Link to="/login?signup=true&plan=pro" className="block">
                <Button className="w-full bg-white text-green-600 hover:bg-gray-100">Upgrade</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-4">$99<span className="text-lg text-gray-500">/mes</span></div>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>Ubicaciones ilimitadas</li>
                <li>Equipo multi-usuario</li>
                <li>Soporte dedicado</li>
                <li>Integraciones custom</li>
              </ul>
              <Link to="/login" className="block">
                <Button className="w-full" variant="outline">Contactar</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para simplificar tu inventario?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a cientos de restaurantes que ya usan ReStocka
          </p>
          <Link to="/login?signup=true">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-12">
              Crear Cuenta Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="text-white font-semibold">ReStocka</span>
            </div>
            <div className="text-sm">
              © 2025 ReStocka. Hecho con ❤️ para restaurantes.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
