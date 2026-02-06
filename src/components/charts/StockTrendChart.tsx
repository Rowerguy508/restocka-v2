import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface StockHistoryItem {
  product_id: string;
  product_name: string;
  quantity: number;
  recorded_at: string;
}

interface StockTrendChartProps {
  data: StockHistoryItem[];
  loading?: boolean;
}

// Generate distinct colors for each product
const COLORS = [
  'hsl(25, 90%, 48%)',   // Primary orange
  'hsl(142, 71%, 45%)',  // Green
  'hsl(200, 80%, 50%)',  // Blue
  'hsl(280, 70%, 50%)',  // Purple
  'hsl(38, 92%, 50%)',   // Yellow
  'hsl(340, 70%, 50%)',  // Pink
  'hsl(180, 60%, 45%)',  // Teal
  'hsl(0, 72%, 51%)',    // Red
];

export function StockTrendChart({ data, loading }: StockTrendChartProps) {
  const { chartData, products } = useMemo(() => {
    if (!data.length) return { chartData: [], products: [] };

    // Group by date and product
    const dateMap = new Map<string, Record<string, number>>();
    const productSet = new Set<string>();

    data.forEach((item) => {
      const date = new Date(item.recorded_at).toLocaleDateString('es-DO', {
        day: '2-digit',
        month: 'short',
      });
      
      productSet.add(item.product_name);
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {});
      }
      dateMap.get(date)![item.product_name] = item.quantity;
    });

    const products = Array.from(productSet).slice(0, 5); // Limit to 5 products
    
    // Convert to chart format, sorted by date
    const chartData = Array.from(dateMap.entries())
      .map(([date, values]) => ({
        date,
        ...values,
      }))
      .slice(-14); // Last 14 data points

    return { chartData, products };
  }, [data]);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Tendencias de stock</CardTitle>
              <CardDescription>Historial de niveles por producto</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="h-40 w-full max-w-md bg-muted rounded-lg" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Tendencias de stock</CardTitle>
              <CardDescription>Historial de niveles por producto</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex flex-col items-center justify-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 opacity-20 mb-3" />
            <p className="font-medium">Sin datos históricos</p>
            <p className="text-sm mt-1">Los cambios de stock se registrarán automáticamente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Tendencias de stock</CardTitle>
            <CardDescription>
              Últimos {chartData.length} registros (top 5 productos)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-3 min-w-[140px]">
                        <p className="font-medium text-foreground text-sm mb-2">{label}</p>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-muted-foreground truncate max-w-[100px]">
                                {entry.dataKey}
                              </span>
                            </div>
                            <span className="font-medium text-foreground">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                content={({ payload }) => (
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground truncate max-w-[80px]">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
              {products.map((product, index) => (
                <Line
                  key={product}
                  type="monotone"
                  dataKey={product}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: COLORS[index % COLORS.length] }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
