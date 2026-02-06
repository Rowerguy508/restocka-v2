import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/cn"
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Truck,
  Plug,
  MapPin,
  Settings,
  X,
} from "lucide-react"

const ownerLinks = [
  { to: "/app/owner", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/owner/products", label: "Products", icon: Package },
  { to: "/app/owner/usage", label: "Usage", icon: FileText },
  { to: "/app/owner/suppliers", label: "Suppliers", icon: Users },
  { to: "/app/owner/rules", label: "Rules", icon: FileText },
  { to: "/app/owner/purchase-orders", label: "Orders", icon: Truck },
  { to: "/app/owner/integrations", label: "Integrations", icon: Plug },
  { to: "/app/owner/locations", label: "Locations", icon: MapPin },
  { to: "/app/owner/settings", label: "Settings", icon: Settings },
]

interface OwnerSidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export function OwnerSidebar({ mobile, onClose }: OwnerSidebarProps) {
  const location = useLocation()

  const handleLinkClick = () => {
    if (mobile && onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Logo - only show on desktop */}
      {!mobile && (
        <div className="hidden lg:flex h-16 items-center gap-3 border-b border-border px-6">
          <img src="/sidebar_logo.png" alt="ReStocka" className="h-9 w-auto" />
          <span className="text-xl font-bold text-foreground">ReStocka</span>
        </div>
      )}
      
      {/* Mobile logo with close button */}
      {mobile && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <img src="/sidebar_logo.png" alt="ReStocka" className="h-8 w-auto" />
            <span className="text-lg font-bold text-foreground">ReStocka</span>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="space-y-1 p-4">
        {ownerLinks.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section - hidden on mobile */}
      {!mobile && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-cyan-500/10 p-4 border border-white/5">
            <p className="text-xs text-muted-foreground mb-2">Pro Plan</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-foreground">$29</span>
              <span className="text-xs text-muted-foreground">/month</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
