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

export function OwnerSidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r/50 bg-sidebar/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/20">
          <span className="text-lg font-bold text-white">R</span>
        </div>
        <span className="text-xl font-bold text-gradient">Restocka</span>
      </div>
      
      {/* Navigation */}
      <nav className="space-y-1 p-4">
        {ownerLinks.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-lg shadow-primary/10 border border-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground hover-lift"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-cyan-500/10 p-4 border border-white/5">
          <p className="text-xs text-muted-foreground mb-2">Pro Plan</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">$29</span>
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
