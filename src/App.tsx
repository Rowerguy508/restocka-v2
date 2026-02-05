import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
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

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
