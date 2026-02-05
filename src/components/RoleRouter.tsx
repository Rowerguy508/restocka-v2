import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

export function RoleRouter() {
  const { role, loading, membership, error, refreshRole } = useAuth();

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <ErrorState
          title="Error de Acceso"
          message={error.message || "No pudimos verificar tu cuenta."}
          retry={refreshRole}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!membership) {
    return <Navigate to="/onboarding" replace />;
  }

  if (role === 'OWNER') {
    return <Navigate to="/app/owner" replace />;
  }

  if (role === 'MANAGER') {
    return <Navigate to="/app/manager" replace />;
  }

  return <Navigate to="/login" replace />;
}
