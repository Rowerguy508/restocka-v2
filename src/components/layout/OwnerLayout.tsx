import { Outlet } from "react-router-dom"
import { OwnerSidebar } from "@/components/owner/OwnerSidebar"
import { OwnerHeader } from "@/components/owner/OwnerHeader"

export function OwnerLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <OwnerSidebar />
      
      {/* Main content */}
      <div className="pl-64">
        <OwnerHeader />
        <main className="p-6">
          {/* Page content with glass effect */}
          <div className="glass-card p-6 animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
