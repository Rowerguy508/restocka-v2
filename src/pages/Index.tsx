import { Link } from 'react-router-dom';
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
    
    pricing_title: 'Simple Pricing',
    pricing_subtitle: 'Start free, scale when you need',
    pricing_free: 'Free',
    pricing_free_price: '$0',
    pricing_free_features: ['Up to 100 products', '1 location', 'Basic alerts'],
    pricing_pro: 'Pro',
    pricing_pro_price: '$29',
    pricing_pro_features: ['Unlimited products', 'Up to 5 locations', 'AI predictions', 'Priority support'],
    pricing_enterprise: 'Enterprise',
    pricing_enterprise_price: '$99',
    pricing_enterprise_features: ['Unlimited locations', 'Multi-user teams', 'API access', 'Dedicated support'],
    
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
    
    pricing_title: 'Precios Simples',
    pricing_subtitle: 'Empieza gratis, escala cuando necesites',
    pricing_free: 'Gratis',
    pricing_free_price: '$0',
    pricing_free_features: ['Hasta 100 productos', '1 ubicación', 'Alertas básicas'],
    pricing_pro: 'Pro',
    pricing_pro_price: '$29',
    pricing_pro_features: ['Productos ilimitados', 'Hasta 5 ubicaciones', 'Predicciones AI', 'Soporte prioritario'],
    pricing_enterprise: 'Enterprise',
    pricing_enterprise_price: '$99',
    pricing_enterprise_features: ['Ubicaciones ilimitadas', 'Equipos multi-usuario', 'API access', 'Soporte dedicado'],
    
    cta_title: '¿Listo para simplificar tu inventario?',
    cta_subtitle: 'Únete a cientos de restaurantes que ya usan ReStocka',
    cta_button: 'Crear Cuenta Gratis',
    
    demo_title: '🎯 Prueba ReStocka Sin Registrarte',
    demo_subtitle: 'Explora el panel completo con datos de ejemplo. Sin compromiso.',
    demo_features: ['12 productos con inventarios reales', 'Alertas de stock bajo', 'Predicciones AI', 'Carrito de pedidos funcional', 'Estadísticas en tiempo real'],
    demo_cta: 'Ver Demo Ahora',
    demo_cta_subtitle: 'Tarda menos de 1 minuto',
    
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

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locale, setLocale] = useState<'en' | 'es'>('en');

  useEffect(() => {
    setLocale(getBrowserLocale());
  }, []);

  const t = TRANSLATIONS[locale];
  const features = FEATURES[locale];
  const benefits = BENEFITS[locale];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-3">
          <img src="/nav_logo.png" alt="ReStocka" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-foreground">ReStocka</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            {t.nav_features}
          </a>
          <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">
            {t.nav_benefits}
          </a>
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            {t.nav_pricing}
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-white/20 text-foreground hover:bg-white/10">
              {t.login}
            </Button>
          </Link>
          <Link to="/login?signup=true">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-medium">
              {t.get_started}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border border-border rounded-xl mx-4 mb-4 p-4 space-y-4 relative z-10">
          <a href="#features" className="block py-2 text-muted-foreground">{t.nav_features}</a>
          <a href="#benefits" className="block py-2 text-muted-foreground">{t.nav_benefits}</a>
          <Link to="/pricing" className="block py-2 text-green-400 font-medium">{t.nav_pricing}</Link>
          <Link to="/login" className="block py-2 text-green-400 font-medium">{t.login}</Link>
          <Link to="/login?signup=true" className="block">
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-black">{t.get_started}</Button>
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            {t.hero_title}{' '}
            <span className="text-gradient">{t.hero_title_green}</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login?signup=true">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-lg px-8 text-black font-medium glow-green">
                {t.get_started}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 border-white/20 hover:bg-white/10">
                {t.see_demo}
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t.no_credit_card}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            {t.nav_features}
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Powerful but simple tools. Focused on what really matters.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card border border-border p-6 rounded-xl hover-lift">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center mb-4 border border-white/10">
                  <feature.icon className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Why Restaurants Choose ReStocka?
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-lg p-6 border border-white/10">
                <h4 className="font-semibold text-foreground mb-4">Dashboard Example</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg border border-border">
                    <span className="text-sm text-muted-foreground">Active products</span>
                    <span className="font-semibold text-foreground">127</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <span className="text-sm text-red-400">Low stock</span>
                    <span className="font-semibold text-red-400">8</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <span className="text-sm text-green-400">Active orders</span>
                    <span className="font-semibold text-green-400">3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t.pricing_title}
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            {t.pricing_subtitle}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-card border border-border p-6 rounded-xl hover-lift">
              <h3 className="text-xl font-semibold mb-2 text-foreground">{t.pricing_free}</h3>
              <div className="text-4xl font-bold mb-4 text-foreground">{t.pricing_free_price}<span className="text-lg text-muted-foreground">/mo</span></div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                {t.pricing_free_features.map((f: string) => <li key={f}>• {f}</li>)}
              </ul>
              <Link to="/login?signup=true" className="block">
                <Button className="w-full border-white/20 hover:bg-white/10">{t.get_started}</Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-card border border-green-500/30 p-6 rounded-xl relative glow-green">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-400">{t.pricing_pro}</h3>
              <div className="text-4xl font-bold mb-4 text-foreground">{t.pricing_pro_price}<span className="text-lg text-muted-foreground">/mo</span></div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                {t.pricing_pro_features.map((f: string) => <li key={f}>• {f}</li>)}
              </ul>
              <Link to="/login?signup=true&plan=pro" className="block">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold">Upgrade</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-card border border-border p-6 rounded-xl hover-lift">
              <h3 className="text-xl font-semibold mb-2 text-foreground">{t.pricing_enterprise}</h3>
              <div className="text-4xl font-bold mb-4 text-foreground">{t.pricing_enterprise_price}<span className="text-lg text-muted-foreground">/mo</span></div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                {t.pricing_enterprise_features.map((f: string) => <li key={f}>• {f}</li>)}
              </ul>
              <Link to="/login" className="block">
                <Button className="w-full border-white/20 hover:bg-white/10">Contact</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-2xl p-8 max-w-4xl mx-auto border border-green-500/20">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-green-500/20 text-green-400">🎯 DEMO DISPONIBLE</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {t.demo_title}
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {t.demo_subtitle}
              </p>
              <div className="grid md:grid-cols-5 gap-4 mb-8">
                {t.demo_features.map((f: string) => (
                  <div key={f} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/demo">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8">
                  {t.demo_cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                {t.demo_cta_subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-12 max-w-3xl mx-auto border border-green-500/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t.cta_title}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              {t.cta_subtitle}
            </p>
            <Link to="/login?signup=true">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-lg px-12 text-black font-semibold glow-green">
                {t.cta_button}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <img src="/footer_logo.png" alt="ReStocka" className="h-8 w-auto" />
              <span className="text-white font-semibold">ReStocka</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {t.footer}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
