import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface StockItem {
  product_name: string;
  current_qty: number;
  unit: string;
  status: 'OK' | 'LOW' | 'CRITICAL';
}

interface StockChartProps {
  data: StockItem[];
  loading?: boolean;
}

const STATUS_COLORS = {
  OK: 'hsl(142, 71%, 45%)',
  LOW: 'hsl(38, 92%, 50%)',
  CRITICAL: 'hsl(0, 72%, 51%)',
};

export function StockChart({ data, loading }: StockChartProps) {
  const chartData = useMemo(() => {
    return data.slice(0, 8).map((item) => ({
      name: item.product_name.length > 12 
        ? item.product_name.slice(0, 12) + '...' 
        : item.product_name,
      fullName: item.product_name,
      quantity: item.current_qty,
      unit: item.unit,
      status: item.status,
    }));
  }, [data]);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Niveles de inventario</CardTitle>
              <CardDescription>Stock actual por producto</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="h-32 w-full max-w-md bg-muted rounded-lg" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Niveles de inventario</CardTitle>
              <CardDescription>Stock actual por producto</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>No hay datos de inventario disponibles</p>
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
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Niveles de inventario</CardTitle>
            <CardDescription>Stock actual por producto (top 8)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--border))" 
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                        <p className="font-medium text-foreground">{data.fullName}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {data.quantity} {data.unit}
                        </p>
                        <p className={`text-xs mt-1 font-medium ${
                          data.status === 'CRITICAL' ? 'text-status-danger' :
                          data.status === 'LOW' ? 'text-status-warning' :
                          'text-status-success'
                        }`}>
                          {data.status === 'CRITICAL' ? 'Crítico' :
                           data.status === 'LOW' ? 'Bajo' : 'OK'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="quantity" 
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.status]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-status-success" />
            <span className="text-muted-foreground">OK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-status-warning" />
            <span className="text-muted-foreground">Bajo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-status-danger" />
            <span className="text-muted-foreground">Crítico</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
