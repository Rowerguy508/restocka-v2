import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface StockTrendChartProps {
  data: Array<{ date: string; value: number }>
  loading?: boolean
  height?: number
}

export function StockTrendChart({ data, loading, height = 300 }: StockTrendChartProps) {
  if (loading) {
    return (
      <div className="animate-pulse bg-secondary/30 rounded" style={{ height }} />
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
        <p className="text-sm">Sin datos</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {data.length > 1 ? (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#6b7280' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#22c55e" 
            strokeWidth={2}
            dot={{ fill: '#22c55e', strokeWidth: 2 }}
            activeDot={{ r: 4, fill: '#22c55e' }}
          />
        </LineChart>
      ) : (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#6b7280' }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#6b7280' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}
