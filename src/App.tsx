import { useMemo, useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleRouter } from "@/components/auth/RoleRouter";
import { getAppMode, redirectTo } from "@/lib/subdomain";
import { useEffect } from 'react';

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import PricingPage from "./pages/PricingPage";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import ProductsPage from "./pages/owner/ProductsPage";
import UsagePage from "./pages/owner/UsagePage";
import SuppliersPage from "./pages/owner/SuppliersPage";
import RulesPage from "./pages/owner/RulesPage";
import PurchaseOrdersPage from "./pages/owner/PurchaseOrdersPage";
import IntegrationsPage from "./pages/owner/IntegrationsPage";
import LocationsPage from "./pages/owner/LocationsPage";
import SettingsPage from "./pages/owner/SettingsPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import { OwnerLayout } from "@/components/layout/OwnerLayout";

const queryClient = new QueryClient();

// Component to handle initial loading state (fixes blank screen on mobile)
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'rgb(15, 19, 26)',
      color: 'white'
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#16a34a',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p style={{ marginTop: 16, opacity: 0.8 }}>Loading ReStocka...</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Component to enforce subdomain-based redirects
function SubdomainEnforcer() {
  const { user, loading } = useAuth();
  const mode = getAppMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const path = window.location.pathname;

    // App subdomain should only have /app/* routes
    if (mode === 'app') {
      if (!path.startsWith('/app') && !path.startsWith('/login')) {
        if (user) {
          navigate('/app', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }
    }
    
    // Login subdomain should only have /login
    if (mode === 'login') {
      if (path !== '/' && path !== '/login' && user) {
        navigate('/', { replace: true });
      }
    }
  }, [mode, user, loading, navigate]);

  return null;
}

// Component to handle initial redirect to dashboard
function DashboardRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && window.location.pathname === '/app') {
      navigate('/app/owner', { replace: true });
    }
  }, [user, navigate]);

  return null;
}

// Landing page routes (restocka.app, www.restocka.app)
function LandingRoutes() {
  const { user } = useAuth();

  // Redirect logged-in users to dashboard
  if (user) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Login-only routes (login.restocka.app)
function LoginRoutes() {
  const { user } = useAuth();

  // Redirect logged-in users to dashboard
  if (user) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// App routes (app.restocka.app) - Protected dashboard
function AppRoutes() {
  return (
    <Routes>
      {/* Onboarding - accessible even if auth is loading */}
      <Route path="/onboarding" element={<OnboardingPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<OwnerLayout />}>
          <Route path="/" element={<DashboardRedirect />} />
          <Route path="/app" element={<RoleRouter />} />
          
          {/* Owner routes */}
          <Route path="/app/" element={<Navigate to="/app/owner" replace />} />
          <Route path="/app/owner" element={<OwnerDashboard />} />
          <Route path="/app/owner/" element={<Navigate to="/app/owner" replace />} />
          <Route path="/app/owner/products" element={<ProductsPage />} />
          <Route path="/app/owner/usage" element={<UsagePage />} />
          <Route path="/app/owner/suppliers" element={<SuppliersPage />} />
          <Route path="/app/owner/rules" element={<RulesPage />} />
          <Route path="/app/owner/purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="/app/owner/integrations" element={<IntegrationsPage />} />
          <Route path="/app/owner/locations" element={<LocationsPage />} />
          <Route path="/app/owner/settings" element={<SettingsPage />} />
          
          {/* Manager routes */}
          <Route path="/app/manager" element={<ManagerDashboard />} />
        </Route>
      </Route>

      {/* Login page accessible from app subdomain */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<Navigate to="/" replace />} />
      
      {/* Catch-all - show something instead of blank */}
      <Route path="*" element={<FallbackPage />} />
    </Routes>
  );
}

// Fallback page when routes don't match
function FallbackPage() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">Inicia Sesión</h1>
          <p className="text-zinc-400 mb-6">Tu sesión ha expirado o no tienes acceso.</p>
          <a 
            href="/login" 
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Ir a Login
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Bienvenido a ReStocka</h1>
        <p className="text-zinc-400 mb-6">Completa tu configuración para comenzar.</p>
        <a 
          href="/onboarding" 
          className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Completar Configuración
        </a>
      </div>
    </div>
  );
}

const App = () => {
  const mode = useMemo(() => getAppMode(), []);
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);

  // Check if Supabase is initialized before rendering routes
  useEffect(() => {
    // Give Supabase a moment to initialize
    const checkSupabase = setTimeout(() => {
      setSupabaseInitialized(true);
    }, 500);

    return () => clearTimeout(checkSupabase);
  }, []);

  const RoutesComponent = useMemo(() => {
    switch (mode) {
      case 'app':
        return AppRoutes;
      case 'login':
        return LoginRoutes;
      default:
        return LandingRoutes;
    }
  }, [mode]);

  // Show loading screen while Supabase initializes (fixes blank screen on mobile)
  if (!supabaseInitialized) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SubdomainEnforcer />
            <RoutesComponent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
