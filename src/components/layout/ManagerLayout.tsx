import { Outlet } from "react-router-dom"
import { ManagerSidebar } from "@/components/manager/ManagerSidebar"
import { ManagerHeader } from "@/components/manager/ManagerHeader"

export function ManagerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <ManagerSidebar />
      <div className="pl-64">
        <ManagerHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
