import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Bell, TrendingUp, Users, CheckCircle, ArrowRight, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Detect browser language
const getBrowserLocale = (): 'en' | 'es' => {
  const lang = navigator.language || navigator.languages?.[0] || 'en';
  return lang.startsWith('es') ? 'es' : 'en';
};

// Translations
const TRANSLATIONS = {
  en: {
    nav_features: 'Features',
    nav_benefits: 'Benefits',
    nav_pricing: 'Pricing',
    login: 'Sign In',
    get_started: 'Get Started Free',
    see_demo: 'See Demo',
    no_credit_card: 'No credit card required • Setup in 2 minutes',
    
    hero_title: 'Inventory Control for',
    hero_title_green: 'Restaurants',
    hero_subtitle: 'The simplest way to manage your inventory. Smart alerts, automatic orders, and your team always informed.',
    
    cta_title: 'Ready to simplify your inventory?',
    cta_subtitle: 'Join hundreds of restaurants already using ReStocka',
    cta_button: 'Create Free Account',
    
    footer: '© 2025 ReStocka. Made with ❤️ for restaurants.',
  },
  es: {
    nav_features: 'Características',
    nav_benefits: 'Beneficios',
    nav_pricing: 'Precios',
    login: 'Iniciar Sesión',
    get_started: 'Empezar Gratis',
    see_demo: 'Ver Demo',
    no_credit_card: 'No se requiere tarjeta de crédito • Configuración en 2 minutos',
    
    hero_title: 'Control de Inventario para',
    hero_title_green: 'Restaurantes',
    hero_subtitle: 'La forma más simple de gestionar tu inventario. Alertas automáticas, pedidos inteligentes, y tu equipo siempre informado.',
    
    cta_title: '¿Listo para simplificar tu inventario?',
    cta_subtitle: 'Únete a cientos de restaurantes que ya usan ReStocka',
    cta_button: 'Crear Cuenta Gratis',
    
    footer: '© 2025 ReStocka. Hecho con ❤️ para restaurantes.',
  },
};

const FEATURES = {
  en: [
    {
      icon: Package,
      title: 'Simple Inventory Control',
      description: 'Manage your products simply. Never run out of what you need.',
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Get notified when stock is low. Discover usage trends.',
    },
    {
      icon: TrendingUp,
      title: 'Automatic Orders',
      description: 'Configurable restocking rules. Buy only when needed.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite your team. Everyone sees what they need.',
    },
  ],
  es: [
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
  ],
};

const BENEFITS = {
  en: [
    'Reduce waste by up to 30%',
    'Never run out of critical products',
    'Save time on manual counts',
    'Price history by supplier',
    'Multi-location for restaurants',
    'WhatsApp integration coming soon',
  ],
  es: [
    'Reduce desperdicios hasta un 30%',
    'Evita quedarte sin productos críticos',
    'Ahorra tiempo en conteos manuales',
    'Historial de precios por proveedor',
    'Multi-ubicación para restaurantes',
    'Integración WhatsApp coming soon',
  ],
};

const PRICING = {
  en: {
    title: 'Simple Pricing',
    subtitle: 'Start free, scale when you need',
    free: { name: 'Free', price: '$0', features: ['Up to 100 products', '1 location', 'Basic alerts'] },
    pro: { name: 'Pro', price: '$29', features: ['Unlimited products', 'Up to 5 locations', 'Automatic orders', 'API access'] },
    enterprise: { name: 'Enterprise', price: '$99', features: ['Unlimited locations', 'Multi-user team', 'Dedicated support', 'Custom integrations'] },
  },
  es: {
    title: 'Precios Simples',
    subtitle: 'Empieza gratis, escala cuando necesites',
    free: { name: 'Free', price: '$0', features: ['Hasta 100 productos', '1 ubicación', 'Alertas básicas'] },
    pro: { name: 'Pro', price: '$29', features: ['Productos ilimitados', 'Hasta 5 ubicaciones', 'Pedidos automáticos', 'API access'] },
    enterprise: { name: 'Enterprise', price: '$99', features: ['Ubicaciones ilimitadas', 'Equipo multi-usuario', 'Soporte dedicado', 'Integraciones custom'] },
  },
};

export default function Index() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locale, setLocale] = useState<'en' | 'es'>('en');

  useEffect(() => {
    setLocale(getBrowserLocale());
  }, []);

  const t = TRANSLATIONS[locale];
  const features = FEATURES[locale];
  const benefits = BENEFITS[locale];
  const pricing = PRICING[locale];

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
            {t.nav_features}
          </a>
          <a href="#benefits" className="text-gray-600 hover:text-green-600 transition-colors">
            {t.nav_benefits}
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-green-600 transition-colors">
            {t.nav_pricing}
          </a>
          <Link to="/login">
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              {t.login}
            </Button>
          </Link>
          <Link to="/login?signup=true">
            <Button className="bg-green-600 hover:bg-green-700">
              {t.get_started}
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
          <a href="#features" className="block py-2 text-gray-600">{t.nav_features}</a>
          <a href="#benefits" className="block py-2 text-gray-600">{t.nav_benefits}</a>
          <a href="#pricing" className="block py-2 text-gray-600">{t.nav_pricing}</a>
          <Link to="/login" className="block py-2 text-green-600 font-medium">{t.login}</Link>
          <Link to="/login?signup=true" className="block">
            <Button className="w-full bg-green-600 hover:bg-green-700">{t.get_started}</Button>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t.hero_title}{' '}
            <span className="text-green-600">{t.hero_title_green}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login?signup=true">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8">
                {t.get_started}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 border-green-600 text-green-600 hover:bg-green-50">
                {t.see_demo}
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {t.no_credit_card}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t.nav_features}
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Powerful but simple tools. Focused on what really matters.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
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
                Why Restaurants Choose ReStocka?
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Dashboard Example</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Active products</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-600">Low stock</span>
                    <span className="font-semibold text-red-600">8</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-600">Active orders</span>
                    <span className="font-semibold text-green-600">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {pricing.title}
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            {pricing.subtitle}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{pricing.free.name}</h3>
              <div className="text-4xl font-bold mb-4">{pricing.free.price}<span className="text-lg text-gray-500">/mo</span></div>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                {pricing.free.features.map(f => <li key={f}>• {f}</li>)}
              </ul>
              <Link to="/login?signup=true" className="block">
                <Button className="w-full" variant="outline">{t.get_started}</Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-green-600 p-6 rounded-xl shadow-lg transform scale-105">
              <h3 className="text-xl font-semibold mb-2 text-white">{pricing.pro.name}</h3>
              <div className="text-4xl font-bold mb-4 text-white">{pricing.pro.price}<span className="text-lg text-green-200">/mo</span></div>
              <ul className="space-y-2 text-sm text-green-100 mb-6">
                {pricing.pro.features.map(f => <li key={f}>• {f}</li>)}
              </ul>
              <Link to="/login?signup=true&plan=pro" className="block">
                <Button className="w-full bg-white text-green-600 hover:bg-gray-100">Upgrade</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{pricing.enterprise.name}</h3>
              <div className="text-4xl font-bold mb-4">{pricing.enterprise.price}<span className="text-lg text-gray-500">/mo</span></div>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                {pricing.enterprise.features.map(f => <li key={f}>• {f}</li>)}
              </ul>
              <Link to="/login" className="block">
                <Button className="w-full" variant="outline">Contact</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.cta_title}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t.cta_subtitle}
          </p>
          <Link to="/login?signup=true">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-12">
              {t.cta_button}
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
              {t.footer}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
