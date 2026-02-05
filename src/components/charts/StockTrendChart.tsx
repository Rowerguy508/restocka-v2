import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface StockTrendChartProps {
  data: Array<{ date: string; value: number }>
}

export function StockTrendChart({ data }: StockTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
