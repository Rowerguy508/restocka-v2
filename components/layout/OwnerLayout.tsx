import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Package,
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const ownerNavItems: NavItem[] = [
  { href: '/app/owner', label: 'Panel', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/app/owner/products', label: 'Productos', icon: <Utensils className="h-5 w-5" /> },
  { href: '/app/owner/usage', label: 'Uso diario', icon: <TrendingUp className="h-5 w-5" /> },
  { href: '/app/owner/suppliers', label: 'Suplidores', icon: <Truck className="h-5 w-5" /> },
  { href: '/app/owner/rules', label: 'Reglas', icon: <Settings className="h-5 w-5" /> },
  { href: '/app/owner/purchase-orders', label: 'Órdenes', icon: <ShoppingCart className="h-5 w-5" /> },
];

interface OwnerLayoutProps {
  children: ReactNode;
}

export function OwnerLayout({ children }: OwnerLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const NavContent = () => (
    <nav className="flex flex-col gap-1">
      {ownerNavItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
          <Package className="h-7 w-7 text-sidebar-primary" />
          <span className="text-lg font-bold text-sidebar-foreground">ReStocka</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <NavContent />
        </div>

        <div className="border-t border-sidebar-border p-4">
          <div className="mb-3 px-3">
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-sidebar border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-sidebar-primary" />
          <span className="font-bold text-sidebar-foreground">ReStocka</span>
        </div>
        
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-sidebar border-sidebar-border p-0">
            <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
              <span className="font-bold text-sidebar-foreground">Menú</span>
            </div>
            <div className="p-4">
              <NavContent />
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
              <p className="text-xs text-sidebar-foreground/50 mb-3 px-3 truncate">
                {user?.email}
              </p>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="pt-14 lg:pt-0 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
