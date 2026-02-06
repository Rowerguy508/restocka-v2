import { useState } from 'react'
import { Outlet } from "react-router-dom"
import { OwnerSidebar } from "@/components/owner/OwnerSidebar"
import { OwnerHeader } from "@/components/owner/OwnerHeader"
import { Menu, X } from 'lucide-react'

export function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <img src="/sidebar_logo.png" alt="ReStocka" className="h-8 w-auto" />
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <OwnerSidebar mobile onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <OwnerSidebar />
      </div>
      
      {/* Main content - full width on mobile */}
      <div className="lg:pl-64">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden sticky top-0 z-30 bg-background border-b border-border">
          <div className="flex items-center justify-between h-16 px-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-secondary"
            >
              <Menu className="h-6 w-6" />
            </button>
            <img src="/nav_logo.png" alt="ReStocka" className="h-8 w-auto" />
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>
        
        {/* Desktop header */}
        <div className="hidden lg:block">
          <OwnerHeader />
        </div>
        
        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="bg-card border border-border rounded-xl lg:rounded-2xl p-4 lg:p-6 animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
