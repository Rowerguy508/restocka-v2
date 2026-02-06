import { useAuth } from "@/contexts/AuthContext"

export function OwnerHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-14 lg:h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 lg:px-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-base lg:text-lg font-semibold text-foreground truncate">Dashboard</h1>
        <p className="text-xs text-muted-foreground hidden sm:block">Manage your inventory</p>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-4">
        {/* User avatar - show email on larger screens */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-cyan-400 text-sm lg:text-sm font-bold text-black">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground truncate max-w-[150px]">{user?.email || 'User'}</p>
            <p className="text-xs text-muted-foreground">Owner</p>
          </div>
        </div>
      </div>
    </header>
  )
}
