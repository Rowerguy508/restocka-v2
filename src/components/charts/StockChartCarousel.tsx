import { StockTrendChart } from './StockTrendChart'
import { Package } from 'lucide-react'

interface StockChartCarouselProps {
  data: Array<{ product_id?: string; product_name?: string; current_qty?: number; status?: string }>
  loading?: boolean
}

export function StockChartCarousel({ data, loading }: StockChartCarouselProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl border p-4 lg:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-primary/10 rounded w-1/3" />
          <div className="h-48 bg-secondary/50 rounded" />
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-6 lg:p-8">
        <div className="text-center py-8">
          <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <Package className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground">Sin datos de inventario</p>
        </div>
      </div>
    )
  }

  // Show top 10 products sorted by quantity (lowest first)
  const sortedProducts = [...data]
    .filter(item => item.product_id)
    .sort((a, b) => (a.current_qty || 0) - (b.current_qty || 0))
    .slice(0, 10)

  return (
    <div className="bg-card rounded-xl border p-4 lg:p-6">
      <h3 className="font-semibold text-base lg:text-lg mb-4">Productos con menor stock</h3>
      <div className="space-y-4">
        {sortedProducts.map((product, index) => (
          <div key={product.product_id || index} className="border rounded-lg p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm lg:text-base">{product.product_name}</p>
              <span className={`text-xs lg:text-sm px-2 py-0.5 rounded-full ${
                product.status === 'CRITICAL' ? 'bg-status-danger/20 text-status-danger' :
                product.status === 'LOW' ? 'bg-status-warning/20 text-status-warning' :
                'bg-status-success/20 text-status-success'
              }`}>
                {product.current_qty || 0}
              </span>
            </div>
            <StockTrendChart 
              data={[{ date: 'Now', value: product.current_qty || 0 }]} 
              height={100}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
