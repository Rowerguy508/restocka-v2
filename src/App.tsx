import { useMemo } from 'react';
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
        
        {/* Onboarding (standalone, not in layout) */}
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>

      {/* Login page accessible from app subdomain */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<Navigate to="/" replace />} />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const App = () => {
  const mode = useMemo(() => getAppMode(), []);

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
