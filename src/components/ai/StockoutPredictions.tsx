import { Package, TrendingDown, AlertTriangle } from 'lucide-react';

interface PredictionResult {
  productId: string;
  productName: string;
  currentStock: number;
  dailyUsage: number;
  daysUntilStockout: number;
  suggestedOrderDate: Date;
  suggestedQuantity: number;
  confidence: number;
  reason: string;
}

interface StockoutPredictionsProps {
  predictions: PredictionResult[];
  loading?: boolean;
}

const getDaysColor = (days: number): string => {
  if (days <= 1) return 'text-status-danger';
  if (days <= 3) return 'text-status-warning';
  if (days <= 7) return 'text-primary';
  return 'text-status-success';
};

const getDaysBadge = (days: number): string => {
  if (days <= 1) return 'bg-status-danger/20 text-status-danger';
  if (days <= 3) return 'bg-status-warning/20 text-status-warning';
  if (days <= 7) return 'bg-primary/20 text-primary';
  return 'bg-status-success/20 text-status-success';
};

const getBadgeLabel = (days: number): string => {
  if (days <= 1) return 'Urgente';
  if (days <= 3) return 'Pronto';
  return 'OK';
};

export function StockoutPredictions({ predictions, loading }: StockoutPredictionsProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl border p-4 lg:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-primary/10 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 lg:h-16 bg-secondary/50 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Predicciones</h3>
        </div>
        <div className="text-center py-6 lg:py-8">
          <div className="h-12 w-12 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-status-success" />
          </div>
          <p className="font-medium text-foreground">Sin predicciones</p>
          <p className="text-xs lg:text-sm text-muted-foreground mt-1">Agrega datos de uso para predicciones</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingDown className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Predicciones</h3>
        <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
          {predictions.length} items
        </span>
      </div>
      
      <div className="space-y-2 lg:space-y-3">
        {predictions.map((pred, index) => (
          <div
            key={pred.productId}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 rounded-lg lg:rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors gap-2"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`text-xl lg:text-2xl font-bold ${getDaysColor(pred.daysUntilStockout)}`}>
                {pred.daysUntilStockout}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm lg:text-base truncate">{pred.productName}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    {pred.currentStock} units • {pred.dailyUsage.toFixed(1)}/day
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getDaysBadge(pred.daysUntilStockout)}`}>
                    {getBadgeLabel(pred.daysUntilStockout)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-left sm:text-right pl-10 sm:pl-0">
              <p className="text-xs text-muted-foreground">Ordenar antes</p>
              <p className="font-medium text-foreground text-sm">
                {pred.suggestedOrderDate.toLocaleDateString('es-DO', {
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {pred.suggestedQuantity} units
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="h-3 w-3" />
          Predicciones basadas en patrones de uso históricos
        </p>
      </div>
    </div>
  );
}
