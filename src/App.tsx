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

// Get current hostname - defensive check for SSR/edge cases
const getHostname = (): string => {
  if (typeof window === 'undefined') return 'restocka.app';
  return window.location.hostname || 'restocka.app';
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

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 animate-pulse mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
function SubdomainRouter({ children }: { children: React.ReactNode }) {
  const [mode] = useState<AppMode>(getAppMode);

  useEffect(() => {
    console.log('SubdomainRouter - mode:', mode);
  }, [mode]);

  // Let routes handle auth redirects - just pass through
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
