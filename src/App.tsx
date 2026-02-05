import { useEffect, useState, useMemo } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleRouter } from "@/components/auth/RoleRouter";

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

// Get current hostname
const getHostname = () => {
  return window.location.hostname;
};

// Determine app mode based on hostname
type AppMode = 'landing' | 'login' | 'app';

const getAppMode = (): AppMode => {
  const hostname = getHostname();
  
  if (hostname === 'app.restocka.app') {
    return 'app';
  }
  if (hostname === 'login.restocka.app') {
    return 'login';
  }
  return 'landing';
};

const queryClient = new QueryClient();

// Subdomain-aware root component
function SubdomainRouter({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [mode] = useState<AppMode>(getAppMode);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect based on subdomain and auth state
    if (loading) return;

    const currentPath = window.location.pathname;

    if (mode === 'app') {
      // app.restocka.app should always go to /app/*
      if (!currentPath.startsWith('/app')) {
        if (user) {
          navigate('/app', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }
    } else if (mode === 'login') {
      // login.restocka.app should always be on /login or auth pages
      if (user && currentPath === '/login') {
        navigate('/app', { replace: true });
      }
    } else {
      // landing page - redirect logged-in users to app
      if (user && (currentPath === '/' || currentPath === '/login')) {
        navigate('/app', { replace: true });
      }
    }
  }, [mode, user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return <>{children}</>;
}

// Landing page routes (restocka.app, www.restocka.app)
function LandingRoutes() {
  const { user } = useAuth();

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

// App routes (app.restocka.app)
function AppRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/app" element={<RoleRouter />} />
        
        {/* Owner routes */}
        <Route path="/app/owner" element={<OwnerDashboard />} />
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

      {/* Non-protected routes on app subdomain */}
      <Route path="/login" element={<LoginPage />} />
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
            <SubdomainRouter>
              <RoutesComponent />
            </SubdomainRouter>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
