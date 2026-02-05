import { useMemo, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { BarChart3, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface StockItem {
  product_name: string;
  current_qty: number;
  unit: string;
  status: 'OK' | 'LOW' | 'CRITICAL';
  location_name: string;
  location_id?: string;
}

interface StockChartCarouselProps {
  data: StockItem[];
  loading?: boolean;
}

const STATUS_COLORS = {
  OK: 'hsl(142, 71%, 45%)',
  LOW: 'hsl(38, 92%, 50%)',
  CRITICAL: 'hsl(0, 72%, 51%)',
};

export function StockChartCarousel({ data, loading }: StockChartCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Group data by location
  const locationData = useMemo(() => {
    const grouped = data.reduce((acc, item) => {
      const key = item.location_name || 'Sin ubicación';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, StockItem[]>);

    return Object.entries(grouped).map(([location, items]) => ({
      location,
      items: items.slice(0, 10).map((item) => ({
        name: item.product_name.length > 12 
          ? item.product_name.slice(0, 12) + '...' 
          : item.product_name,
        fullName: item.product_name,
        quantity: item.current_qty,
        unit: item.unit,
        status: item.status,
      })),
    }));
  }, [data]);

  const totalLocations = locationData.length;
  const currentLocation = locationData[currentIndex];

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalLocations - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalLocations - 1 ? 0 : prev + 1));
  };

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

  if (data.length === 0 || totalLocations === 0) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Niveles de inventario</CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                {currentLocation?.location}
              </CardDescription>
            </div>
          </div>
          
          {totalLocations > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                {currentIndex + 1} / {totalLocations}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={currentLocation?.items || []}
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
                {(currentLocation?.items || []).map((entry, index) => (
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

        {/* Location dots */}
        {totalLocations > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {locationData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
