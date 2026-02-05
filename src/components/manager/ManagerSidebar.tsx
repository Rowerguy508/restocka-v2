import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/cn"
import { LayoutDashboard, Package, Truck, Users } from "lucide-react"

const managerLinks = [
  { to: "/app/manager", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/manager/products", label: "Products", icon: Package },
  { to: "/app/manager/orders", label: "Orders", icon: Truck },
  { to: "/app/manager/team", label: "Team", icon: Users },
]

export function ManagerSidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="text-xl font-bold">Restocka</span>
      </div>
      <nav className="space-y-1 p-4">
        {managerLinks.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
