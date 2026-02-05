import { cn } from "@/lib/cn"

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "error" | "success" | "warning"
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const statusStyles = {
    active: "status-verde",
    inactive: "bg-gray-100 text-gray-600 border-gray-300",
    pending: "status-amarillo",
    error: "status-rojo",
    success: "status-verde",
    warning: "status-amarillo",
  }

  const statusLabels = {
    active: "Activo",
    inactive: "Inactivo",
    pending: "Pendiente",
    error: "Error",
    success: "Éxito",
    warning: "Advertencia",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {label || statusLabels[status]}
    </span>
  )
}

interface StockStatusBadgeProps {
  stockLevel: 'critical' | 'low' | 'normal' | 'overstocked'
  label?: string
  className?: string
}

export function StockStatusBadge({ stockLevel, label, className }: StockStatusBadgeProps) {
  const stockStyles = {
    critical: "status-rojo",
    low: "status-amarillo",
    normal: "status-verde",
    overstocked: "bg-blue-100 text-blue-600 border-blue-300",
  }

  const stockLabels = {
    critical: "Crítico",
    low: "Bajo",
    normal: "Normal",
    overstocked: "Sobre stock",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        stockStyles[stockLevel],
        className
      )}
    >
      {label || stockLabels[stockLevel]}
    </span>
  )
}

interface POStatusBadgeProps {
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled'
  label?: string
  className?: string
}

export function POStatusBadge({ status, label, className }: POStatusBadgeProps) {
  const poStyles = {
    draft: "bg-gray-100 text-gray-600 border-gray-300",
    pending: "status-amarillo",
    approved: "bg-blue-100 text-blue-600 border-blue-300",
    ordered: "bg-purple-100 text-purple-600 border-purple-300",
    received: "status-verde",
    cancelled: "status-rojo",
  }

  const poLabels = {
    draft: "Borrador",
    pending: "Pendiente",
    approved: "Aprobado",
    ordered: "Ordenado",
    received: "Recibido",
    cancelled: "Cancelado",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        poStyles[status],
        className
      )}
    >
      {label || poLabels[status]}
    </span>
  )
}
