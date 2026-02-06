import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleRouter } from "@/components/auth/RoleRouter";
import { LocationProvider } from "@/contexts/LocationContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import ProductsPage from "./pages/owner/ProductsPage";
import UsagePage from "./pages/owner/UsagePage";
import SuppliersPage from "./pages/owner/SuppliersPage";
import RulesPage from "./pages/owner/RulesPage";
import PurchaseOrdersPage from "./pages/owner/PurchaseOrdersPage";
import IntegrationsPage from "./pages/owner/IntegrationsPage";
import SettingsPage from "./pages/owner/SettingsPage";
import LocationsPage from "./pages/owner/LocationsPage";
import ManagerDashboard from "./pages/manager/ManagerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LocationProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />

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
                <Route path="/app/owner/settings" element={<SettingsPage />} />
                <Route path="/app/owner/locations" element={<LocationsPage />} />

                {/* Manager routes */}
                <Route path="/app/manager" element={<ManagerDashboard />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LocationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
