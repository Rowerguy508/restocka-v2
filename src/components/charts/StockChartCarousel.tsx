import { StockTrendChart } from './StockTrendChart'

interface StockChartCarouselProps {
  products: Array<{ id: string; name: string; history: Array<{ date: string; value: number }> }>
}

export function StockChartCarousel({ products }: StockChartCarouselProps) {
  if (products.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No products to display
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">{product.name}</h3>
          <StockTrendChart data={product.history} />
        </div>
      ))}
    </div>
  )
}
