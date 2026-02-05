import { useAuth } from "@/contexts/AuthContext"

export function OwnerHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-xl px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Owner Dashboard</h1>
        <p className="text-xs text-muted-foreground">Manage your inventory & orders</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* User avatar */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-cyan-400 text-sm font-bold text-black">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user?.email || 'User'}</p>
            <p className="text-xs text-muted-foreground">Owner</p>
          </div>
        </div>
      </div>
    </header>
  )
}
