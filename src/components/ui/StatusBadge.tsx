import { Badge } from '@/components/ui/badge';
import type { StockStatus, POStatus } from '@/types/database';

interface StatusBadgeProps {
  status: StockStatus;
}

export function StockStatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<StockStatus, { variant: 'verde' | 'amarillo' | 'rojo'; label: string }> = {
    OK: { variant: 'verde', label: 'Bien' },
    LOW: { variant: 'amarillo', label: 'Bajo' },
    CRITICAL: { variant: 'rojo', label: 'Crítico' },
  };

  const { variant, label } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
}

interface POStatusBadgeProps {
  status: POStatus;
}

export function POStatusBadge({ status }: POStatusBadgeProps) {
  const variants: Record<POStatus, { variant: 'draft' | 'sent' | 'delivered' | 'problem' | 'canceled'; label: string }> = {
    DRAFT: { variant: 'draft', label: 'Borrador' },
    SENT: { variant: 'sent', label: 'Enviada' },
    DELIVERED: { variant: 'delivered', label: 'Entregada' },
    PROBLEM: { variant: 'problem', label: 'Problema' },
    CANCELED: { variant: 'canceled', label: 'Cancelada' },
  };

  const { variant, label } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
}
