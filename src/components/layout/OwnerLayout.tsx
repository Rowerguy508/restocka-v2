import { Outlet } from "react-router-dom"
import { OwnerSidebar } from "@/components/owner/OwnerSidebar"
import { OwnerHeader } from "@/components/owner/OwnerHeader"

export function OwnerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <OwnerSidebar />
      <div className="pl-64">
        <OwnerHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
